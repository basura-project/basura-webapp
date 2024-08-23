import os
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
from dotenv import load_dotenv
import warnings
warnings.filterwarnings("ignore")
import streamlit as st
from torch.utils.data import Dataset
from copy import deepcopy as dc
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path
dotenv_path = Path('hyperparameters.env')  # Specify the path to your .env file
load_dotenv(dotenv_path=dotenv_path)
from torch.utils.data import DataLoader

Filename_address = os.getenv("FILE_ADDRESS")
Output_address = os.getenv("OUTPUT_ADDRESS")
close = "Close"
lag = int(os.getenv("LAG", 20))
epochs = int(os.getenv("EPOCHS", 10))
learning_rate = float(os.getenv("LEARNING_RATE", 0.001))
batch_size = int(os.getenv("BATCH_SIZE", 32))
number_nodes = int(os.getenv("NUMBER_NODES", 50))
days = int(os.getenv("Prediction_days", 800))
n = int(os.getenv("NN_LAGS", 20))


def data_loader():
    data = pd.read_csv(Filename_address, index_col="Date", parse_dates=True)
    data = data.dropna()
    print(data.shape)
    data = data.resample('D').asfreq()
    data = data.fillna(method='ffill')
    print(data.shape)
    return data
def data_loader():
    data = pd.read_csv(Filename_address, index_col="Date", parse_dates=True)
    data = data.dropna()
    print(data.shape)
    data = data.resample('D').asfreq()
    data = data.fillna(method='ffill')
    print(data.shape)
    return data
data =  data_loader()
with st.expander("current dataframe", expanded = False):
    st.dataframe(data, use_container_width = True )



class TimeSeriesDataset(Dataset):
    def __init__(self, df, target_cols, n_steps = 5):
        self.df = df
        self.target_cols = target_cols
        self.n_steps = n_steps
        self.scaler = MinMaxScaler(feature_range=(-1,1))
        self.df_scaled = pd.DataFrame(self.scaler.fit_transform(self.df),columns = self.df.columns)
        
        # adding a shift to each target column
        self.features, self.targets = self.prepare_data()
    def prepare_data(self):
        df = dc(self.df_scaled)
        features = []
        targets = []
        for col in self.target_cols:
            for i in range(1,self.n_steps + 1):
                df[f'{col}(t-{i})'] = df[col].shift(i)
        # print("\n shifted columns:\n")
        # print(df.head(10))
        
        df.dropna(inplace = True)
        
        for col in self.target_cols:
            col_features = df[[f'{col}(t-{i})' for i in range(1, self.n_steps+1)]].values
            col_target = df[[col]].values
            col_features = np.flip(col_features, axis = 1)
            features.append(col_features)
            targets.append(col_target)
        features = np.concatenate(features, axis =0)
        targets = np.concatenate(targets, axis = 0)
        # Print the features and targets for validation
        # print("\nFirst few rows of Features:")
        # print(features[:10])  # Print the first 10 feature rows
        # print("\nFirst few rows of Targets:")
        # print(targets[:10]) 
        return features, targets
    def __len__(self):
        return len(self.features)
    def __getitem__(self, idx):
        
        X = self.features[idx].reshape(self.n_steps, 1)  # Reshape to (n_steps, num_features)
        y = self.targets[idx].reshape(1)  # Reshape to (1,) for the target
        
        # Convert to torch tensors
        X = torch.tensor(X, dtype=torch.float32)
        y = torch.tensor(y, dtype=torch.float32)
        return X,y    

lookback = 7 #look back
selected_option = st.selectbox("Select the material", data.columns )
if st.button("select"):
    
    target_columns = data.columns
    dataset = TimeSeriesDataset(df = data, target_cols= [selected_option] , n_steps= lookback) #target_columns
    X, y = dataset[1]
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_dataset, test_dataset = torch.utils.data.random_split(dataset, [train_size, test_size])
    
    # Create DataLoader objects for batching
    batch_size = 8
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        #print(device)
    
    
    class LSTM(nn.Module):
        def __init__(self, input_size, hidden_size, num_stacked_layers):
            super().__init__()
            self.hidden_size = hidden_size
            self.num_stacked_layers = num_stacked_layers
    
            self.lstm = nn.LSTM(input_size, hidden_size, num_stacked_layers,
                                batch_first=True)
    
            self.fc = nn.Linear(hidden_size, 1)
    
        def forward(self, x):
            if len(x.shape) == 2:
                x = x.unsqueeze(0)
            batch_size = x.size(0)
            h0 = torch.zeros(self.num_stacked_layers, batch_size, self.hidden_size).to(device)
            c0 = torch.zeros(self.num_stacked_layers, batch_size, self.hidden_size).to(device)
    
            out, _ = self.lstm(x, (h0, c0))
            out = self.fc(out[:, -1, :])
            return out
    
    model = LSTM(1, 60, 6)
    model.to(device)
    
    
    def train_one_epoch():
        model.train(True)
        print(f'Epoch: {epoch + 1}')
        running_loss = 0.0
        all_x_train = []
        all_y_train = []
    
        for batch_index, batch in enumerate(train_loader):
            x_batch, y_batch = batch[0].to(device), batch[1].to(device)
            all_x_train.append(x_batch.cpu().numpy())
            all_y_train.append(y_batch.cpu().numpy())
    
            output = model(x_batch)
            loss = loss_function(output, y_batch)
            running_loss += loss.item()
    
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    
            if batch_index % 100 == 99:  # print every 100 batches
                avg_loss_across_batches = running_loss / 100
                # print('Batch {0}, Loss: {1:.3f}'.format(batch_index+1,
                #                                         avg_loss_across_batches))
                # running_loss = 0.0
        
        all_x_train = np.concatenate(all_x_train, axis=0)
        all_y_train = np.concatenate(all_y_train, axis=0)
    
        return all_x_train, all_y_train
    def validate_one_epoch():
        model.train(False)
        running_loss = 0.0
    
        for batch_index, batch in enumerate(test_loader):
            x_batch, y_batch = batch[0].to(device), batch[1].to(device)
    
            with torch.no_grad():
                output = model(x_batch)
                loss = loss_function(output, y_batch)
                running_loss += loss.item()
    
        avg_loss_across_batches = running_loss / len(test_loader)
    
        # print('Val Loss: {0:.3f}'.format(avg_loss_across_batches))
        # print('***************************************************')
        # print()
    learning_rate = 0.001
    num_epochs = 50
    loss_function = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    progress_text = "Running..."
    my_bar = st.progress(0, text=progress_text)
    for epoch in range(num_epochs):
        st.spinner()
        X_train, y_train =train_one_epoch()
        validate_one_epoch()
        progress_percentage = int((epoch + 1) / num_epochs * 100)
        my_bar.progress(progress_percentage, text=progress_text)
    model_path = "TDA/basura/model/LSTM_weights.pth"
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    torch.save(model.state_dict(), model_path)
    st.write("Model training complete and saved successfully.")
    
 ########################################################################################################################   
    def scale_data(data, columns):
        scalers = {}
        scaled_data = pd.DataFrame()
    
        for column in columns:
            scaler = MinMaxScaler(feature_range=(-1, 1))
            scaled_column = scaler.fit_transform(data[[column]])
            scaled_data[column] = scaled_column.flatten()
            scalers[column] = scaler  # Store the scaler for later inverse transformation
    
        return scaled_data, scalers
    
    # Example usage:
    target_columns = [selected_option] #target
    scaled_data, scalers = scale_data(data, target_columns)
    
    
    
    lookback = 7  # Choose your lookback period
    target_column = [selected_option] #target
    
    dataset = TimeSeriesDataset(data, target_column, n_steps=lookback)
    
    # Create DataLoader for batching
    batch_size = 16
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    def evaluate_model(model, loader, scaler):
        model.load_state_dict(torch.load(model_path))
        model.eval()  # Set model to evaluation mode
        #print("model loaded sucessfully.......")
        predictions = []
        actuals = []
    
        with torch.no_grad():  # Disable gradient computation
            for batch in loader:
                x_batch, y_batch = batch[0].to(device), batch[1].to(device)
                
                # Generate predictions
                predicted = model(x_batch).cpu().numpy()
                
                # Collect predictions and actual values
                predictions.append(predicted)
                actuals.append(y_batch.cpu().numpy())
    
        # Concatenate predictions and actual values
        predictions = np.concatenate(predictions, axis=0).flatten()
        actuals = np.concatenate(actuals, axis=0).flatten()
    
        # Inverse transform predictions and actuals
        dummies = np.zeros((predictions.shape[0], lookback + 1))
        dummies[:, 0] = predictions
        dummies = scaler.inverse_transform(dummies)
        predictions_original_scale = dummies[:, 0]
    
        # Inverse transform actuals
        actuals_original_scale = scaler.inverse_transform(actuals.reshape(-1, 1)).flatten()
    
        return predictions_original_scale, actuals_original_scale
    
    # Evaluate model on 'Close' column
    predictions, actuals = evaluate_model(model, loader, scalers[selected_option])
    
    # Check the first few predictions
    # st.write("Prediction",predictions[:10])
    # st.write("Actual",actuals[:10])
    
 ##################################################################################################################################

    
    
    # Plot the actual values
    def plot_actual():
        plt.figure(figsize=(10, 6))
        plt.plot(actuals, label="Actual", color='blue', linestyle='-', linewidth=1.5)
        plt.xlabel('Time Steps')
        plt.ylabel('Original Scale')
        plt.title(selected_option)
        plt.legend()
        plt.grid(True)
        st.pyplot(plt)
    
    # Plot the predicted values
    def plot_predicted():
        plt.figure(figsize=(10, 6))
        plt.plot(predictions, label='Predicted', color='red', linestyle='-', linewidth=1.5)
        plt.xlabel('Time Steps')
        plt.ylabel('Original Scale')
        plt.title(selected_option)
        plt.legend()
        plt.grid(True)
        st.pyplot(plt)
    
    # Plot both together
    def plot_together():
        plt.figure(figsize=(10, 6))
        plt.plot(actuals, label='Actual', color='blue', linestyle='-', linewidth=1.5)
        plt.plot(predictions, label='Predicted', color='red', linestyle='--', linewidth=1.5)
        plt.xlabel('Time Steps')
        plt.ylabel('Original Scale')
        plt.title('Actual vs Predicted - Original Scale')
        plt.legend()
        plt.grid(True)
        st.pyplot(plt)
    tab1, tab2 = st.tabs(["Separate", "Merged"])
    with tab1:
        st.subheader("Actual")
        plot_actual() 
        st.subheader("Predicted")
        plot_predicted()
    with tab2:
        st.subheader("Merged")
        plot_together()
        

###############################################################################################################################
    # import matplotlib.pyplot as plt
    
    # # Define the range of the time frame to zoom in on (e.g., last 100 time steps)
    # zoom_range = 100  # Adjust this to the number of points you want to zoom in on
    
    # # Ensure the range doesn't exceed the length of your data
    # start_idx = max(0, len(actuals) - zoom_range)
    # end_idx = len(actuals)
    
    # # Plot the zoomed-in version for actual values
    # plt.figure(figsize=(10, 6))
    # plt.plot(actuals[start_idx:end_idx], label='Actual Close', color='blue', linestyle='-', linewidth=1.5)
    # plt.xlabel('Time Steps (Zoomed In)')
    # plt.ylabel('Close (Original Scale)')
    # plt.title('Zoomed-In Actual Close Prices - Original Scale')
    # plt.legend()
    # plt.show()
    
    # # Plot the zoomed-in version for predicted values
    # plt.figure(figsize=(10, 6))
    # plt.plot(predictions[start_idx:end_idx], label='Predicted Close', color='red', linestyle='-', linewidth=1.5)
    # plt.xlabel('Time Steps (Zoomed In)')
    # plt.ylabel('Close (Original Scale)')
    # plt.title('Zoomed-In Predicted Close Prices - Original Scale')
    # plt.legend()
    # plt.show()
    
    # # Plot both together (Zoomed In)
    # plt.figure(figsize=(10, 6))
    # plt.plot(actuals[start_idx:end_idx], label='Actual Close', color='blue', linestyle='-', linewidth=1.5)
    # plt.plot(predictions[start_idx:end_idx], label='Predicted Close', color='red', linestyle='--', linewidth=1.5)
    # plt.xlabel('Time Steps (Zoomed In)')
    # plt.ylabel('Close (Original Scale)')
    # plt.title('Zoomed-In Actual vs Predicted Close Prices - Original Scale')
    # plt.legend()
    # plt.show()
    
    
    scaler = MinMaxScaler(feature_range=(-1, 1))
    scaler.fit(data[['Close']])  # Fit only on the 'Close' column
    
    
    
    
    def predict_next_days(model, last_sequence, scaler, days=7):
        model.load_state_dict(torch.load(model_path))
        model.eval()  # Set the model to evaluation mode
        print("model loaded sucessfully.......")
        predictions = []
    
        # Initialize the sequence with the last known data
        current_sequence = last_sequence
    
        with torch.no_grad():  # Disable gradient computation for prediction
            for _ in range(days):
                # Convert the current sequence to a tensor with shape (1, n_steps, 1)
                x_input = torch.tensor(current_sequence, dtype=torch.float32).to(device).unsqueeze(0)
    
                # Generate the prediction
                predicted = model(x_input).cpu().numpy()
    
                # Reshape the predicted value to (1, 1) before inverse transforming
                predicted_price = scaler.inverse_transform(predicted.reshape(-1, 1))[0][0]
    
                # Store the predicted price
                predictions.append(predicted_price)
    
                # Update the sequence: remove the first value and append the predicted value
                current_sequence = np.roll(current_sequence, -1)
                current_sequence[-1] = predicted[0][0]  # Update with the predicted value
    
        return predictions
    
    # Get the last sequence from the dataset to predict the next 10 days
    last_sequence = dataset.features[-1].reshape(-1, 1)  # Shape it as (n_steps, 1)
    
    # Predict the next 10 days
    predicted_prices_next_10_days = predict_next_days(model, last_sequence, scaler, days=10)
    
    # Print the predicted prices for the next 10 days
    st.write("Predicted Prices for the next 10 days:")
    st.write(predicted_prices_next_10_days)
    tab1 = st.tabs(["next 10 days"])[0]
    with tab1:
        st.subheader("next 10 days")
        historical_prices = data[selected_option][-100:].values  # Last 50 days of historical data
        predicted_prices_next_10_days = predicted_prices_next_10_days 
        days_historical = list(range(len(historical_prices)))
        days_prediction = list(range(len(historical_prices), len(historical_prices) + len(predicted_prices_next_10_days)))
        plt.figure(figsize=(10, 6))
        plt.plot(days_historical, historical_prices, label="Historical Prices", marker='o')
        plt.plot(days_prediction, predicted_prices_next_10_days, label="Predicted Next 10 Days", marker='x')
        plt.title("Stock Prices: Historical vs Predicted")
        plt.xlabel("Days")
        plt.ylabel(selected_option)
        plt.legend()
        plt.grid(True)
        st.pyplot(plt)
    




