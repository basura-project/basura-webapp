import torch
import torch.nn as nn
from math import sqrt
import torch
import torch.nn as nn
from transformers import LlamaConfig, LlamaModel, LlamaTokenizer
from torch import Tensor

class FlattenHead(nn.Module):
    def __init__(self, n_vars, nf, target_window, head_dropout=0):
        super(FlattenHead, self).__init__()
        self.n_vars = n_vars
        self.flatten = nn.Flatten(start_dim=-2)
        self.linear = nn.Linear(nf, target_window)
        self.dropout = nn.Dropout(head_dropout)

    def forward(self, x):
        x = self.flatten(x)
        x = self.linear(x)
        x = self.dropout(x)
        return x

# class Configs:
#     def __init__(self):
#         # Task-specific configurations
#         self.task_name = 'long_term_forecast'  # e.g., 'long_term_forecast', 'short_term_forecast'
#         self.pred_len = 96  # Number of time steps to predict
#         self.seq_len = 192  # Length of input sequence
        
#         # Model hyperparameters
#         self.d_ff = 4096  # Feedforward dimension in the model
#         self.llm_layers = 12  # Number of layers in the LLM model
#         self.d_model = 512  # Dimensionality of model layers
#         self.dropout = 0.1  # Dropout rate
#         self.n_heads = 8  # Number of attention heads in the transformer
        
#         # LLM-specific configurations
#         self.llm_model = 'LLAMA'  # LLM model name
#         self.llm_dim = 4096  # Dimensionality of the LLM (e.g., for LLAMA, GPT-2, etc.)
        
#         # Encoder input size (e.g., the number of features)
#         self.enc_in = 7  # Input size for the encoder (number of input features)
#         self.patch_len = 16  # Length of each patch for Patch Embedding
#         self.stride = 8  # Stride for Patch Embedding
#         self.enc_in = 7  # Input size (e.g., number of features in the time series)
#         self.prompt_domain = False  # Whether to use prompt domain
#         self.content = None  # Placeholder for any additional content you might need


# # Create the configuration object
# configs = Configs()

# patch embedding
class PatchEmbedding(nn.Module):
    def __init__(self, d_model, patch_len, stride, dropout):
        super(PatchEmbedding, self).__init__()
        # Patching
        self.patch_len = patch_len
        self.stride = stride
        self.padding_patch_layer = ReplicationPad1d((0, stride))

        # Backbone, Input encoding: projection of feature vectors onto a d-dim vector space
        self.value_embedding = TokenEmbedding(patch_len, d_model)

        # Residual dropout
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # Patching: divide the input into patches
        n_vars = x.shape[1]
        x = self.padding_patch_layer(x)
        x = x.unfold(dimension=-1, size=self.patch_len, step=self.stride)  # Create patches
        
        # Reshape into (batch_size * number_of_vars, patch_size, num_patches)
        x = torch.reshape(x, (x.shape[0] * x.shape[1], x.shape[2], x.shape[3]))
        
        # Input encoding: Embed the patches
        x = self.value_embedding(x)
        
        return self.dropout(x), n_vars


class TokenEmbedding(nn.Module):
    def __init__(self, c_in, d_model):
        super(TokenEmbedding, self).__init__()
        padding = 1 if torch.__version__ >= '1.5.0' else 2
        self.tokenConv = nn.Conv1d(in_channels=c_in, out_channels=d_model,
                                   kernel_size=3, padding=padding, padding_mode='circular', bias=False)
        for m in self.modules():
            if isinstance(m, nn.Conv1d):
                nn.init.kaiming_normal_(m.weight, mode='fan_in', nonlinearity='leaky_relu')

    def forward(self, x):
        # Apply the convolution and transpose back to original format
        x = self.tokenConv(x.permute(0, 2, 1)).transpose(1, 2)
        return x



class ReplicationPad1d(nn.Module):
    def __init__(self, padding) -> None:
        super(ReplicationPad1d, self).__init__()
        self.padding = padding

    def forward(self, input: Tensor) -> Tensor:
        replicate_padding = input[:, :, -1].unsqueeze(-1).repeat(1, 1, self.padding[-1])
        output = torch.cat([input, replicate_padding], dim=-1)
        return output

class ReprogrammingLayer(nn.Module):
    def __init__(self, d_model, n_heads, d_keys=None, d_llm=None, attention_dropout=0.1):
        super(ReprogrammingLayer, self).__init__()

        d_keys = d_keys or (d_model // n_heads)

        # Projections for query, key, and value
        self.query_projection = nn.Linear(d_model, d_keys * n_heads)
        self.key_projection = nn.Linear(d_llm, d_keys * n_heads)
        self.value_projection = nn.Linear(d_llm, d_keys * n_heads)
        
        # Output projection
        self.out_projection = nn.Linear(d_keys * n_heads, d_llm)
        self.n_heads = n_heads
        self.dropout = nn.Dropout(attention_dropout)

    def forward(self, target_embedding, source_embedding, value_embedding):
        B, L, _ = target_embedding.shape  # Batch size, Sequence length, Embedding dimension
        S, _ = source_embedding.shape  # Sequence length of source embedding
        H = self.n_heads  # Number of attention heads

        # Project target, source, and value embeddings
        target_embedding = self.query_projection(target_embedding).view(B, L, H, -1)
        source_embedding = self.key_projection(source_embedding).view(S, H, -1)
        value_embedding = self.value_projection(value_embedding).view(S, H, -1)

        # Perform attention with reprogramming
        out = self.reprogramming(target_embedding, source_embedding, value_embedding)

        # Reshape and project the output
        out = out.reshape(B, L, -1)
        return self.out_projection(out)

    def reprogramming(self, target_embedding, source_embedding, value_embedding):
        B, L, H, E = target_embedding.shape  # Batch size, Sequence length, Heads, Embedding dimension

        # Scaled dot-product attention
        scale = 1. / sqrt(E)
        scores = torch.einsum("blhe,she->bhls", target_embedding, source_embedding)
        attention = torch.softmax(scale * scores, dim=-1)

        # Reprogramming the embedding
        reprogramming_embedding = torch.einsum("bhls,she->blhe", self.dropout(attention), value_embedding)
        return reprogramming_embedding


class Normalize(nn.Module):
    def __init__(self, num_features: int, eps=1e-5, affine=False, subtract_last=False, non_norm=False):
        """
        :param num_features: the number of features or channels
        :param eps: a value added for numerical stability
        :param affine: if True, RevIN has learnable affine parameters
        """
        super(Normalize, self).__init__()
        self.num_features = num_features
        self.eps = eps
        self.affine = affine
        self.subtract_last = subtract_last
        self.non_norm = non_norm
        if self.affine:
            self._init_params()

    def forward(self, x, mode: str):
        if mode == 'norm':
            self._get_statistics(x)
            x = self._normalize(x)
        elif mode == 'denorm':
            x = self._denormalize(x)
        else:
            raise NotImplementedError
        return x

    def _init_params(self):
        # initialize RevIN params: (C,)
        self.affine_weight = nn.Parameter(torch.ones(self.num_features))
        self.affine_bias = nn.Parameter(torch.zeros(self.num_features))

    def _get_statistics(self, x):
        dim2reduce = tuple(range(1, x.ndim - 1))
        if self.subtract_last:
            self.last = x[:, -1, :].unsqueeze(1)
        else:
            self.mean = torch.mean(x, dim=dim2reduce, keepdim=True).detach()
        self.stdev = torch.sqrt(torch.var(x, dim=dim2reduce, keepdim=True, unbiased=False) + self.eps).detach()

    def _normalize(self, x):
        if self.non_norm:
            return x
        if self.subtract_last:
            x = x - self.last
        else:
            x = x - self.mean
        x = x / self.stdev
        if self.affine:
            x = x * self.affine_weight
            x = x + self.affine_bias
        return x

    def _denormalize(self, x):
        if self.non_norm:
            return x
        if self.affine:
            x = x - self.affine_bias
            x = x / (self.affine_weight + self.eps * self.eps)
        x = x * self.stdev
        if self.subtract_last:
            x = x + self.last
        else:
            x = x + self.mean
        return x



class Model(nn.Module):
    def __init__(self, configs):
        super(Model, self).__init__()
        
        # Assign configurations
        self.task_name = configs.task_name
        self.pred_len = configs.pred_len
        self.seq_len = configs.seq_len
        self.d_ff = configs.d_ff
        self.top_k = 5
        self.d_llm = configs.llm_dim
        self.patch_len = configs.patch_len
        self.stride = configs.stride

        # Load pre-trained LLAMA model
        if configs.llm_model == 'LLAMA':
            self.llama_config = LlamaConfig.from_pretrained('huggyllama/llama-7b')
            self.llama_config.num_hidden_layers = configs.llm_layers
            self.llama_config.output_attentions = True
            self.llama_config.output_hidden_states = True

            try:
                self.llm_model = LlamaModel.from_pretrained(
                    'huggyllama/llama-7b',
                    trust_remote_code=True,
                    local_files_only=False,
                    config=self.llama_config
                )
            except EnvironmentError:
                print("Local model files not found. Attempting to download...")
                self.llm_model = LlamaModel.from_pretrained(
                    'huggyllama/llama-7b',
                    trust_remote_code=True,
                    local_files_only=False,
                    config=self.llama_config
                )
            
            try:
                self.tokenizer = LlamaTokenizer.from_pretrained(
                    'huggyllama/llama-7b',
                    trust_remote_code=True,
                    local_files_only=False
                )
            except EnvironmentError:
                print("Local tokenizer files not found. Attempting to download...")
                self.tokenizer = LlamaTokenizer.from_pretrained(
                    'huggyllama/llama-7b',
                    trust_remote_code=True,
                    local_files_only=False
                )
        else:
            raise Exception('LLM model is not defined')

        # Setup tokenizer pad token if missing
        if self.tokenizer.eos_token:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        else:
            pad_token = '[PAD]'
            self.tokenizer.add_special_tokens({'pad_token': pad_token})
            self.tokenizer.pad_token = pad_token

        # Freeze LLM model parameters
        for param in self.llm_model.parameters():
            param.requires_grad = False

        # Description or domain prompt
        if configs.prompt_domain:
            self.description = configs.content
        else:
            self.description = "Basura is a waste management company dedicated to sustainability, public health, and community well-being through responsible waste handling and resource recovery."

        # Initialize model components
        self.dropout = nn.Dropout(configs.dropout)
        self.patch_embedding = PatchEmbedding(configs.d_model, self.patch_len, self.stride, configs.dropout)

        self.word_embeddings = self.llm_model.get_input_embeddings().weight
        self.vocab_size = self.word_embeddings.shape[0]
        self.num_tokens = 1000
        self.mapping_layer = nn.Linear(self.vocab_size, self.num_tokens)

        self.reprogramming_layer = ReprogrammingLayer(configs.d_model, configs.n_heads, self.d_ff, self.d_llm)

        # Calculate the number of patches
        self.patch_nums = int((configs.seq_len - self.patch_len) / self.stride + 2)
        self.head_nf = self.d_ff * self.patch_nums

        # Define output projection
        if self.task_name in ['long_term_forecast', 'short_term_forecast']:
            self.output_projection = FlattenHead(configs.enc_in, self.head_nf, self.pred_len, head_dropout=configs.dropout)
        else:
            raise NotImplementedError

        self.normalize_layers = Normalize(configs.enc_in, affine=False)

    def forward(self, x_enc, x_mark_enc, x_dec, x_mark_dec, mask=None):
        if self.task_name in ['long_term_forecast', 'short_term_forecast']:
            dec_out = self.forecast(x_enc, x_mark_enc, x_dec, x_mark_dec)
            return dec_out[:, -self.pred_len:, :]
        return None

    def forecast(self, x_enc, x_mark_enc, x_dec, x_mark_dec):
        # Normalize the input
        x_enc = self.normalize_layers(x_enc, 'norm')

        B, T, N = x_enc.size()
        x_enc = x_enc.permute(0, 2, 1).contiguous().reshape(B * N, T, 1)

        # Calculate statistics for the prompt
        min_values = torch.min(x_enc, dim=1)[0]
        max_values = torch.max(x_enc, dim=1)[0]
        medians = torch.median(x_enc, dim=1).values
        lags = self.calculate_lags(x_enc)
        trends = x_enc.diff(dim=1).sum(dim=1)

        prompt = []
        for b in range(x_enc.shape[0]):
            min_values_str = str(min_values[b].tolist()[0])
            max_values_str = str(max_values[b].tolist()[0])
            median_values_str = str(medians[b].tolist()[0])
            lags_values_str = str(lags[b].tolist())
            prompt_ = (
                f"<|start_prompt|>Dataset description: {self.description}"
                f"Task description: forecast the next {str(self.pred_len)} steps given the previous {str(self.seq_len)} steps of information; "
                f"Input statistics: min value {min_values_str}, max value {max_values_str}, median value {median_values_str}, "
                f"trend {'upward' if trends[b] > 0 else 'downward'}, top 5 lags: {lags_values_str}<|end_prompt|>"
            )
            prompt.append(prompt_)

        # Process tokenization and embedding
        x_enc = x_enc.reshape(B, N, T).permute(0, 2, 1).contiguous()
        prompt = self.tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=2048).input_ids
        prompt_embeddings = self.llm_model.get_input_embeddings()(prompt.to(x_enc.device))

        source_embeddings = self.mapping_layer(self.word_embeddings.permute(1, 0)).permute(1, 0)

        x_enc = x_enc.permute(0, 2, 1).contiguous()
        enc_out, n_vars = self.patch_embedding(x_enc)#.to(torch.bfloat16))
        enc_out = self.reprogramming_layer(enc_out, source_embeddings, source_embeddings)
        llama_enc_out = torch.cat([prompt_embeddings, enc_out], dim=1)
        dec_out = self.llm_model(inputs_embeds=llama_enc_out).last_hidden_state
        dec_out = dec_out[:, :, :self.d_ff]

        # Reshape and project the output
        dec_out = torch.reshape(dec_out, (-1, n_vars, dec_out.shape[-2], dec_out.shape[-1]))
        dec_out = dec_out.permute(0, 1, 3, 2).contiguous()
        dec_out = self.output_projection(dec_out[:, :, :, -self.patch_nums:])
        dec_out = dec_out.permute(0, 2, 1).contiguous()

        # Denormalize the output
        dec_out = self.normalize_layers(dec_out, 'denorm')

        return dec_out

    def calculate_lags(self, x_enc):
        q_fft = torch.fft.rfft(x_enc.permute(0, 2, 1).contiguous(), dim=-1)
        k_fft = torch.fft.rfft(x_enc.permute(0, 2, 1).contiguous(), dim=-1)
        res = q_fft * torch.conj(k_fft)
        corr = torch.fft.irfft(res, dim=-1)
        mean_value = torch.mean(corr, dim=1)
        _, lags = torch.topk(mean_value, self.top_k, dim=-1)
        return lags



