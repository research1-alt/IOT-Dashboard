
export const defaultDbcContent = `
VERSION ""

NS_ :
    NS_DESC_
    CM_
    BA_DEF_
    BA_
    VAL_
    CAT_DEF_
    CAT_
    FILTER
    BA_DEF_DEF_
    EV_DATA_
    ENVVAR_DATA_
    SGTYPE_
    SGTYPE_VAL_
    BA_DEF_SGTYPE_
    BA_SGTYPE_
    SIG_TYPE_DEF_
    SIG_GROUP_
    SIG_VALTYPE_
    SIGTYPE_VALTYPE_
    BO_TX_BU_
    SG_MUL_VAL_

BS_:

BU_: DBG DRIVER IO

BO_ 1827ff81 MCU_Faults: 8 DBG
 SG_ Odometer : 32|32@1+ (0.1,0) [0|0] "Kms"

BO_ 1038ff50 Battery_Faults: 8 DBG
 SG_ Battery_Cutoff_Low_Voltage_Fault : 8|1@1+ (1,0) [0|1] ""
 SG_ Output_Voltage_Failure_Fault : 9|1@1+ (1,0) [0|1] ""
 SG_ Battery_Internal_Fault : 10|1@1+ (1,0) [0|1] ""
 SG_ Positive_Busbar_High_Temperature_Fault : 11|1@1+ (1,0) [0|1] ""
 SG_ Negative_Busbar_High_Temperature_Fault : 12|1@1+ (1,0) [0|1] ""
 SG_ Positive_Busbar_Over_Temperature_Fault : 13|1@1+ (1,0) [0|1] ""
 SG_ Negative_Busbar_Over_Temperature_Fault : 14|1@1+ (1,0) [0|1] ""
 SG_ Low_SOC_During_Keyon_Fault : 15|1@1+ (1,0) [0|1] ""
 SG_ Low_SOC_During_Drive_Fault : 16|1@1+ (1,0) [0|1] ""
 SG_ Permanent_Doc_PosTemp_Fault : 17|1@1+ (1,0) [0|1] ""
 SG_ Permanent_Dco_NegTemp_Fault : 18|1@1+ (1,0) [0|1] ""
 SG_ TCU_Communication_Fault : 19|1@1+ (1,0) [0|1] ""
 SG_ Battery_LowVoltage_Fault : 7|1@1+ (1,0) [0|1] ""
 SG_ Battery_OverVoltage_Fault : 6|1@1+ (1,0) [0|1] ""
 SG_ Battery_Cutoff_OveVoltage_Fault : 5|1@1+ (1,0) [0|1] ""
 SG_ Battery_Low_Temp_Cutoff_Fault : 4|1@1+ (1,0) [0|1] ""
 SG_ Battery_Low_Temp_Fault : 3|1@1+ (1,0) [0|1] ""
 SG_ Battery_High_Temp_Cutoff_Fault : 2|1@1+ (1,0) [0|1] ""
 SG_ Battery_High_Temp_Fault : 1|1@1+ (1,0) [0|1] ""
 SG_ Battery_Fault : 0|1@1+ (1,0) [0|1] ""

BO_ 405819456 MCU_Faults: 8 DBG
 SG_ Controller_Fault : 0|1@1+ (1,0) [0|1] ""
 SG_ Controller_OverCurrent_Fault : 1|1@1+ (1,0) [0|1] ""
 SG_ Current_Sensor_Fault : 2|1@1+ (1,0) [0|1] ""
 SG_ Precharge_Fault : 3|1@1+ (1,0) [0|1] ""
 SG_ Controller_ServerUndertemp_fault : 4|1@1+ (1,0) [0|1] ""
 SG_ Controller_Severe_Overtemp_Fault : 5|1@1+ (1,0) [0|1] ""
 SG_ Severe_B_Plus_Undervltage_Fault : 6|1@1+ (1,0) [0|1] ""
 SG_ Severe_KSI_Undervoltage_Fault : 7|1@1+ (1,0) [0|1] ""
 SG_ Severe_B_Plus_OverVoltage_Fault : 8|1@1+ (1,0) [0|1] ""
 SG_ Severe_KSI_Overvoltage_Fault : 9|1@1+ (1,0) [0|1] ""
 SG_ Controller_Over_TempCutback_Fault : 10|1@1+ (1,0) [0|1] ""
 SG_ B_Plus_Undervoltage_Cutback_Fault : 11|1@1+ (1,0) [0|1] ""
 SG_ B_Plus_Overvoltage_Cutback_Fault : 12|1@1+ (1,0) [0|1] ""
 SG_ 5V_Supply_Fault : 13|1@1+ (1,0) [0|1] ""
 SG_ Motor_Temp_Hot_Cutback_Fault : 14|1@1+ (1,0) [0|1] ""
 SG_ Motor_Temp_Sensor_Fault : 15|1@1+ (1,0) [0|1] ""
 SG_ Main_Contactor_Open_Short_Fault : 16|1@1+ (1,0) [0|1] ""
 SG_ Sin_Cos_Sensor_Fault : 17|1@1+ (1,0) [0|1] ""
 SG_ Motor_Phase_Open_Fault : 18|1@1+ (1,0) [0|1] ""
 SG_ Main_Contactor_Weld_Fault : 19|1@1+ (1,0) [0|1] ""
 SG_ Main_Contactor_Not_Closing_Fault : 20|1@1+ (1,0) [0|1] ""
 SG_ Throttle_Wiper_High_Fault : 21|1@1+ (1,0) [0|1] ""
 SG_ Throttle_Wiper_low_Fault : 22|1@1+ (1,0) [0|1] ""
 SG_ EEPROM_Fault : 23|1@1+ (1,0) [0|1] ""
 SG_ VCL_Run_Time_Fault : 24|1@1+ (1,0) [0|1] ""
 SG_ Motor_Characterization_Fault : 25|1@1+ (1,0) [0|1] ""
 SG_ Encoder_Pulse_Count_Fault : 26|1@1+ (1,0) [0|1] ""
 SG_ Encoder_LOS_Fault : 27|1@1+ (1,0) [0|1] ""
 SG_ Brake_Wiper_High_Fault : 28|1@1+ (1,0) [0|1] ""
 SG_ Brake_Wiper_Low_Fault : 29|1@1+ (1,0) [0|1] ""
 SG_ High_Pedal_Disable_Fault : 30|1@1+ (1,0) [0|1] ""

BO_ 271061072 Battery_IPC_Info: 8 DBG
 SG_ StateOfCharge : 0|8@1+ (1,0) [0|100] "%"
 SG_ DistanceToEmpty : 8|8@1+ (1,0) [0|255] "Km"
 SG_ TimeToCharge : 16|8@1+ (3,0) [0|765] "Min"
 SG_ BatteryTemp : 24|8@1- (1,0) [-128|127] "degC"
 SG_ KeyOnIndicator : 34|2@1+ (1,0) [0|3] ""
 SG_ BatteryFaultIndicator : 36|2@1+ (1,0) [0|3] ""
 SG_ BatterySwap : 38|1@1+ (1,0) [0|1] ""

BO_ 419365728 Battery_Status_TPDO3: 8 DBG
 SG_ BatteryState : 56|8@1+ (1,0) [0|5] ""

BO_ 337854544 Battery_MCU_Current: 8 DBG
 SG_ BatteryCurrent : 0|16@1- (0.1,0) [-250|250] "A"
 SG_ DriveCurrentLimit : 16|8@1+ (1,0) [0|255] ""
 SG_ RegenCurrentLimit : 24|8@1+ (1,0) [0|255] ""

BO_ 338624400 Battery_IPC_Capacity: 8 DBG
 SG_ BatteryCurrent1 : 0|16@1- (0.1,0) [-250|250] "A"
 SG_ AmpereHours : 16|16@1- (0.01,0) [0|0] "Ahr"
 SG_ KilowattHours : 32|16@1- (0.01,0) [0|0] "kWhr"
 SG_ BatteryPackVoltage : 48|16@1+ (0.01,0) [0|0] "Volt"

BO_ 337920080 Battery_MCU_CellVoltage: 8 DBG
 SG_ MinCellVoltage : 0|16@1+ (0.001,0) [0|0] "Volt"
 SG_ MaxCellVoltage : 32|16@1+ (0.001,0) [0|0] "Volt"

BO_ 405164096 MCU_IPC_ControllerInfo: 8 DBG
 SG_ ControllerTemp : 0|8@1- (1,0) [-40|215] "DegC"
 SG_ MotorTemp : 8|8@1+ (1,-50) [-50|205] "DegC"

BO_ 405229632 MCU_IPC_VehicleInfo: 8 DBG
 SG_ CapacitorVoltage : 16|16@1+ (0.1,0) [0|0] "Volt"
 SG_ Speed : 48|8@1+ (1,0) [0|100] "Kmph"

BO_ 405208961 MCU_IPC_ModeInfo: 8 DBG
 SG_ VehicleMode : 32|3@1+ (1,0) [0|7] ""
 SG_ DriveMode : 56|3@1+ (1,0) [0|7] ""
 SG_ RegenFlag : 59|1@1+ (1,0) [0|1] ""
 SG_ Speed_Mode : 48|8@1+ (1,0) [0|255] "Kmph"

BO_ 1536 MCU_IPC_VehicleInfo_Example: 8 DBG
 SG_ CapacitorVoltage_Example : 16|16@1+ (0.1,0) [0|0] "Volt"
 SG_ Speed_Example : 48|8@1+ (1,0) [0|100] "Kmph"
`;
