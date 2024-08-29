import os
import numpy as np
import pandas as pd
from torch.utils.data import Dataset 
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')
from timefeatures import time_features
from torch.utils.data import DataLoader


class TimeLLMDataset(Dataset):
    def __init__(self, root_path, flag='train', size=None,
                 features='M', data_path='your_dataset.csv',
                 target='target_column', scale=True, timeenc=0, freq='h', percent=100):
        if size is None:
            self.seq_len = 384  # Example sequence length
            self.label_len = 96  # Example label length
            self.pred_len = 96  # Example prediction length
        else:
            self.seq_len = size[0]
            self.label_len = size[1]
            self.pred_len = size[2]

        # Initialize parameters
        assert flag in ['train', 'test', 'val']
        type_map = {'train': 0, 'val': 1, 'test': 2}
        self.set_type = type_map[flag]

        self.features = features
        self.target = target
        self.scale = scale
        self.timeenc = timeenc
        self.freq = freq
        self.percent = percent

        self.root_path = root_path
        self.data_path = data_path
        self.__read_data__()

        self.enc_in = self.data_x.shape[-1]
        self.tot_len = len(self.data_x) - self.seq_len - self.pred_len + 1

    def __read_data__(self):
        self.scaler = StandardScaler()
        df_raw = pd.read_csv(os.path.join(self.root_path, self.data_path))

        cols = list(df_raw.columns)
        #print(cols)
        #cols.remove(self.target)
        cols.remove('Date')
        df_raw = df_raw[['Date'] + cols] #+ [self.target]]
        #print(len(df_raw))

        num_train = int(len(df_raw) * 0.7)
        num_test = int(len(df_raw) * 0.2)
        num_vali = len(df_raw) - num_train - num_test
        border1s = [0, num_train - self.seq_len, len(df_raw) - num_test - self.seq_len]
        border2s = [num_train, num_train + num_vali, len(df_raw)]
        border1 = border1s[self.set_type]
        border2 = border2s[self.set_type]
        #print("border1: ", border1)
        #print("border2: ", border2)
        #print(num_train,num_test,num_vali)

        if self.set_type == 0:
            border2 = (border2 - self.seq_len) * self.percent // 100 + self.seq_len

        if self.features == 'M' or self.features == 'MS':
            cols_data = df_raw.columns[1:]
            #print(cols_data)
            df_data = df_raw[cols_data]
            #print('data',df_data)
        elif self.features == 'S':
            df_data = df_raw[[self.target]]

        if self.scale:
            train_data = df_data[border1s[0]:border2s[0]]
            #print("train", train_data)
            self.scaler.fit(train_data.values)
            data = self.scaler.transform(df_data.values)
            #print(data)
        else:
            data = df_data.values

        df_stamp = df_raw[['Date']][border1:border2]
        df_stamp['Date'] = pd.to_datetime(df_stamp.Date)
        #print(self.timeenc)
        if self.timeenc == 0:
            df_stamp['month'] = df_stamp.Date.apply(lambda row: row.month, 1)
            df_stamp['day'] = df_stamp.Date.apply(lambda row: row.day, 1)
            df_stamp['weekday'] = df_stamp.Date.apply(lambda row: row.weekday(), 1)
            df_stamp['hour'] = df_stamp.Date.apply(lambda row: row.hour, 1)
            data_stamp = df_stamp.drop(['Date'], 1).values
            #print('data',data_stamp)
        elif self.timeenc == 1:
            data_stamp = time_features(pd.to_datetime(df_stamp['Date'].values), freq=self.freq)
            data_stamp = data_stamp.transpose(1, 0)
            #print(data_stamp)

        self.data_x = data[border1:border2]
        #print(len(self.data_x))
        self.data_y = data[border1:border2]
        #print(len(self.data_x))
        self.data_stamp = data_stamp
        print(f"data_x shape: {self.data_x.shape}")
        print(f"data_y shape: {self.data_y.shape}")

    def __getitem__(self, index):
        feat_id = index // self.tot_len
        #print("hi",feat_id)
        s_begin = index % self.tot_len

        s_end = s_begin + self.seq_len
        r_begin = s_end - self.label_len
        r_end = r_begin + self.label_len + self.pred_len
        seq_x = self.data_x[s_begin:s_end, :]
        seq_y = self.data_y[r_begin:r_end, :]
        seq_x_mark = self.data_stamp[s_begin:s_end]
        seq_y_mark = self.data_stamp[r_begin:r_end]
        print("seq_x, seq_y", seq_x.shape,seq_y.shape)
        print("seq_x_mark, seq_y_mark", seq_x_mark.shape,seq_y_mark.shape)

        return seq_x, seq_y, seq_x_mark, seq_y_mark

    def __len__(self):
        return (len(self.data_x) - self.seq_len - self.pred_len + 1) * self.enc_in

    def inverse_transform(self, data):
        return self.scaler.inverse_transform(data)



def data_provider(args, flag):
    # Set time encoding based on the 'embed' argument
    #print(args.embed)
    timeenc = 0 if args.embed != 'timeF' else 1
    #print(timeenc)
    
    # Determine whether to shuffle data and whether to drop the last incomplete batch
    if flag == 'test':
        shuffle_flag = False
        drop_last = True
    else:
        shuffle_flag = True
        drop_last = True

    # Set batch size and frequency
    batch_size = args.batch_size
    freq = args.freq

    # Initialize the custom dataset
    data_set = TimeLLMDataset(
        root_path=args.root_path,
        data_path=args.data_path,
        flag=flag,
        size=[args.seq_len, args.label_len, args.pred_len],
        features=args.features,
        target=args.target,
        timeenc=timeenc,
        freq=freq,
        percent=args.percent
    ) #seasonal_patterns=args.seasonal_patterns
    
    # Create DataLoader
    data_loader = DataLoader(
        data_set,
        batch_size=batch_size,
        shuffle=shuffle_flag,
        num_workers=args.num_workers,
        drop_last=drop_last
    )

    return data_set, data_loader



