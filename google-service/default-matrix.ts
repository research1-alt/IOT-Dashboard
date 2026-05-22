
export const defaultDbcContent = `VERSION ""


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
	SIG_TYPE_REF_
	VAL_TABLE_
	SIG_GROUP_
	SIG_VALTYPE_
	SIGTYPE_VALTYPE_
	BO_TX_BU_
	BA_DEF_REL_
	BA_REL_
	BA_DEF_DEF_REL_
	BU_SG_REL_
	BU_EV_REL_
	BU_BO_REL_
	SG_MUL_VAL_

BS_:

BU_: BMS MCU VCU IoT HMI CHG PDU ModeSelector TPMS ADAS_Sensor BCS HVAC BrakingSystem ChangeNote


BO_ 2419654480 ID_0x1038FF50_BattError: 8 BMS
 SG_ Battery_Fault : 0|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Batt_High_Temp : 1|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_High_Temp_Cut_off : 2|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Low_Temp : 3|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Low_Temp_Cut_off : 4|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Over_Voltage_Cut_Off : 5|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Over_Voltage : 6|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Low_Voltage : 7|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Low_Voltage_Cut_Off : 8|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Output_Voltage_Failure : 9|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Internal_Fault : 10|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Postive_Busbar_High_Temperature : 11|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Negative_Busbar_High_Temperature : 12|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Positive_Bus_Over_Temperature : 13|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Negative_Bus_Over_Temperature : 14|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Low_SOC_During_Key_ON : 15|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Low_SOC_During_Drive : 16|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Permannet_Dock_Positive_Temp : 17|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Permannet_Dock_Negative_Temp : 18|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ TCU_Communication_Failure : 19|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ EV_Inverse_Malfunction : 20|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ EV_Out_Sense_Malfunction : 21|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Thermal_Runaway_Alert : 28|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Battery_Thermal_Runway : 29|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Peak_Current_Warning : 42|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
 SG_ Cell_Imbalance : 22|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Cell_Under_Voltage : 23|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Cell_Over_Voltage : 24|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Cell_Over_Voltage_Cut_Off : 25|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Cell_Under_Voltage_Cut_Off : 26|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Weak_Cell_Detected : 43|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Charge_Over_Current : 30|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Discharge_Over_Current : 31|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Short_Circuit_Detected : 32|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Fuse_Blow_Fault : 33|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Isolation_Fault_HV_Positive : 34|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Isolation_Fault_HV_Negative : 35|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ HV_Interlock_Open : 36|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Contactor_Weld_Positive : 37|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Contactor_Weld_Negative : 38|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ SOC_Estimation_Fault : 39|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Voltage_Sensor_Fault : 40|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Current_Sensor_Fault : 41|1@1+ (1,0) [0|1] ""  MCU,IoT,HMI
 SG_ Battery_Immobilise : 42|1@1+ (1,0) [0|1] ""  IoT

BO_ 2418544720 ID_0x10281050_Batt_Live_Statu: 8 BMS
 SG_ State_of_Charger_SOC : 0|8@1+ (1,0) [0|100] "%"  IoT,HMI
 SG_ Distance_To_Empty_DTE : 8|8@1+ (4,0) [0|1000] "km"  IoT,HMI
 SG_ Time_To_Charge : 16|8@1+ (3,0) [0|765] "Minute"  IoT,HMI
 SG_ Battery_Temperature : 24|8@1- (1,0) [-128|127] " C"  IoT,HMI
 SG_ Key_On_Indicator : 34|2@1+ (1,0) [0|3] ""  VCU,MCU,IoT,HMI
 SG_ Battery_Fault_Light : 36|2@1+ (1,0) [0|3] ""  IoT,HMI
 SG_ Total_Battery_Capacity_kWh : 56|8@1+ (1,0) [0|250] "kWh"  IoT,HMI
 SG_ Total_Battery_Capacity_Ah : 47|9@1+ (1,0) [0|510] "Ah"  IoT,HMI
 SG_ Battery_DOD : 40|7@1+ (1,0) [0|100] "%"  IoT,HMI
 SG_ Battery_Swap_Sucessfully : 38|1@1+ (1,0) [0|1] ""  IoT,HMI

BO_ 2485338192 ID_0x14234050_Drive_Limit: 8 BMS
 SG_ Battery_Drive_Current_Live : 0|16@1- (0.1,0) [-3000|3000] "Amp"  MCU,IoT
 SG_ Battery_Drive_Current_Limit : 16|8@1+ (1,0) [0|250] "Amp"  MCU,IoT
 SG_ Battery_Regen_Current_Limit : 24|8@1+ (1,0) [0|255] "Amp"  MCU,IoT
 SG_ Battery_Vehicle_Mode : 32|3@1+ (1,0) [0|7] ""  MCU,IoT,HMI
 SG_ Battery_MaxCurrent_Safety_Limit : 40|8@1+ (2,0) [0|511] "Amp"  IoT,MCU
 SG_ Battery_MaxRegen_Current_Safety : 48|8@1+ (2,0) [0|511] "Amp"  IoT,MCU

BO_ 2566849376 ID_0x18FF0360_Battery_Info: 8 BMS
 SG_ Battery_Charging_Cycle : 40|16@1+ (1,0) [0|50000] "Nos"  HMI,IoT
 SG_ Battery_State_of_Health_SOH : 23|16@0+ (0.01,0) [0|100] "%"  IoT
 SG_ Battery_Pre_Charge_Time : 0|9@0+ (5,0) [0|2500] "ms"  IoT,VCU
 SG_ Battery_Pre_Charge_Complete : 1|1@0+ (1,0) [0|1] ""  VCU,IoT
 SG_ Battery_Drive_State : 56|8@1+ (1,0) [0|255] ""  MCU,VCU,IoT,HMI

BO_ 2486108048 ID_0x142EFF90_Batt_Live_Info: 8 BMS
 SG_ Battery_Live_Current : 0|16@1- (0.1,0) [0|3200] "Amp"  HMI,IoT
 SG_ Battery_Capa_Left_Avaliable_Ah : 16|16@1+ (0.01,0) [0|320] "Ah"  IoT
 SG_ Battery_Capa_Left_Avaliable_kWh : 32|16@1+ (0.01,0) [0|327] "kWh"  IoT
 SG_ Battery_Live_Voltage : 48|16@1+ (0.01,0) [0|654] "V"  IoT,HMI

BO_ 2485403728 ID_0x14244050_Cell_Info: 8 BMS
 SG_ Max_Cell_Voltage_Limit : 48|16@1+ (0.001,0) [0|65] "V"  IoT
 SG_ Max_Cell_Voltage : 0|16@1+ (0.001,0) [0|65] "V"  IoT
 SG_ Mini_Cell_Voltage_Limit : 16|16@1+ (0.001,0) [0|65] "V"  IoT
 SG_ Mini_Cell_Voltage : 32|16@1+ (0.001,0) [0|65] "V"  IoT

BO_ 2418499664 ID_0x10276050_BMS_HWD_SW: 8 BMS
 SG_ Battery_BMS_Soft_Firmware : 32|32@1+ (1,0) [0|4294967295] ""  VCU,IoT
 SG_ Battery_BMS_HWD_Firmware : 0|32@1+ (1,0) [0|4294967295] ""  VCU,IoT

BO_ 2418499648 ID_0x10276040_Battery_VIN: 8 BMS
 SG_ Battery_VIN_Serial_Number : 7|64@0+ (1,0) [0|1E+16] ""  IoT,VCU

BO_ 2471537153 ID_0x1350AA01_Cell_1_4_Volt: 8 BMS
 SG_ Battery_Cell_Volt_1 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_2 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_3 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_4 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537154 ID_0x1350AA02_Cell_5_8_Volt: 8 BMS
 SG_ Battery_Cell_Volt_5 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_6 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_7 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_8 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537155 ID_0x1350AA03_Cell_9_12_Volt: 8 BMS
 SG_ Battery_Cell_Volt_9 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_10 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_11 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_12 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537156 ID_0x1350AA04_Cell_13_16_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_13 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_14 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_15 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_16 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537157 ID_0x1350AA05_Cell_17_20_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_17 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_18 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_19 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_20 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537158 ID_0x1350AA06_Cell_21_24_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_21 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_22 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_23 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_24 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537159 ID_0x1350AA07_Cell_25_28_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_25 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_26 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_27 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_28 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537160 ID_0x1350AA08_Cell_29_32_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_29 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_30 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_31 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_32 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537161 ID_0x1350AA09_Cell_33_36_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_33 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_34 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_35 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_36 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537162 ID_0x1350AA0A_Cell_37_40_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_37 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_38 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_39 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_40 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537163 ID_0x1350AA0B_Cell_41_44_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_41 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_42 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_43 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_44 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537164 ID_0x1350AA0C_Cell_45_48_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_45 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_46 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_47 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_48 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537165 ID_0x1350AA0D_Cell_49_52_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_49 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_50 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_51 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_52 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537166 ID_0x1350AA0E_Cell_53_56_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_53 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_54 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_55 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_56 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537167 ID_0x1350AA0F_Cell_57_60_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_57 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_58 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_59 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_60 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537168 ID_0x1350AA10_Cell_61_64_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_61 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_62 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_63 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_64 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537169 ID_0x1350AA11_Cell_65_68_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_65 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_66 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_67 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_68 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537170 ID_0x1350AA12_Cell_69_72_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_69 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_70 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_71 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_72 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537171 ID_0x1350AA13_Cell_73_76_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_73 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_74 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_75 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_76 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537172 ID_0x1350AA14_Cell_77_80_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_77 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_78 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_79 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_80 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537173 ID_0x1350AA15_Cell_81_84_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_81 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_82 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_83 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_84 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537174 ID_0x1350AA16_Cell_85_88_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_85 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_86 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_87 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_88 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537175 ID_0x1350AA17_Cell_89_92_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_89 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_90 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_91 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_92 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537176 ID_0x1350AA18_Cell_93_96_Voltage: 8 BMS
 SG_ Battery_Cell_Volt_93 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_94 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_95 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_96 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537177 ID_0x1350AA19_Cell_97_100_Voltag: 8 BMS
 SG_ Battery_Cell_Volt_97 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_98 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_99 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_100 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537178 ID_0x1350AA1a_Cell_101_104_Volta: 8 BMS
 SG_ Battery_Cell_Volt_101 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_102 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_103 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_104 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537179 ID_0x1350AA01b_Cell_105_108_Volt: 8 BMS
 SG_ Battery_Cell_Volt_105 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_106 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_107 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_108 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537180 ID_0x1350AA1c_Cell_109_112_Volta: 8 BMS
 SG_ Battery_Cell_Volt_109 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_110 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_111 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_112 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537181 ID_0x1350AA1d_Cell_113_116_Volta: 8 BMS
 SG_ Battery_Cell_Volt_113 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_114 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_115 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_1116 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537182 ID_0x1350AA1e_Cell_117_120_Volta: 8 BMS
 SG_ Battery_Cell_Volt_117 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_118 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_119 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_120 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537183 ID_0x1350AA1f_Cell_121_124_Volta: 8 BMS
 SG_ Battery_Cell_Volt_121 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_122 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_123 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_124 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537185 ID_0x1350AA21_Cell_125_128_Volta: 8 BMS
 SG_ Battery_Cell_Volt_125 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_126 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_127 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_128 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537186 ID_0x1350AA22_Cell_129_132_Volta: 8 BMS
 SG_ Battery_Cell_Volt_129 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_130 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_131 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_132 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537187 ID_0x1350AA23_Cell_133_136_Volta: 8 BMS
 SG_ Battery_Cell_Volt_133 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_134 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_135 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_136 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537188 ID_0x1350AA24_Cell_137_140_Volta: 8 BMS
 SG_ Battery_Cell_Volt_137 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_138 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_139 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_140 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537189 ID_0x1350AA25_Cell_141_144_Volta: 8 BMS
 SG_ Battery_Cell_Volt_141 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_142 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_143 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_144 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537190 ID_0x1350AA26_Cell_145_148_Volta: 8 BMS
 SG_ Battery_Cell_Volt_145 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_146 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_147 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_148 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2471537191 ID_0x1350AA27_Cell_149_152_Volt: 8 BMS
 SG_ Battery_Cell_Volt_149 : 0|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_150 : 16|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_151 : 32|16@1+ (0.0001,0) [0|6] "V"  IoT
 SG_ Battery_Cell_Volt_152 : 48|16@1+ (0.0001,0) [0|6] "V"  IoT

BO_ 2426407422 ID_0x10A009FE_Vehicle_Model: 8 IoT
 SG_ Vehicle_Model_Name : 0|7@1+ (1,0) [0|127] ""  VCU,IoT,BMS

BO_ 2552758145 ID_0x1827FF81_Odo_Meter: 8 VCU
 SG_ Vehicle_Odo_Meter : 32|32@1+ (0.1,0) [0|429496729] "km"  BMS,VCU,IoT,HMI

BO_ 2553303104 ID_0x18305040_MCU_Error: 8 MCU
 SG_ MCU_Controller_Fault : 0|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Controller_Over_Current : 1|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Current_Sensor_Fault : 2|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Precharge_Failed : 3|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Controller_Severe_Under_Temp : 4|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Controller_Severe_Over_Temp : 5|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Severe_B_Plus_OverVoltage : 6|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Servere_KSI_Under_Voltage : 7|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Severe_B_Plus_Over_Voltage : 8|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Severe_KSI_Over_Voltage : 9|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Controller_Over_Temp_Cutback : 10|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_B_Plus_Under_Voltage_Cutback : 11|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_B_Plus_Over_Voltage_Cutback : 12|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_5V_Supply_Failure : 13|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Motor_Temp_Hot_Cutback : 14|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Motor_Temp_Sensor_Fault : 15|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Main_Contactor_Open_Short : 16|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_SIN_COS_Sensor_Fault : 17|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Motor_Phase_Open : 18|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Main_Contactor_Weld : 19|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Contactor_Did_Not_Close : 20|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Throttle_WiperHigh : 21|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Throttle_Wiper_Low : 22|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_EEPROM_Failure : 23|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_VCL_Run_Time_Error : 24|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Motor_Characterisation_Fault : 25|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Encoder_Plus_Count_Fault : 26|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Encoder_LOS : 27|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Brake_Wiper_High : 28|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_Brake_Wiper_Low : 29|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_High_Pedal_Disable : 30|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI
 SG_ MCU_ActiveLowDriverOpenShort : 31|1@0+ (1,0) [0|1] ""  VCU,IoT,BMS,HMI

BO_ 2552647744 ID_0x18265040_MCU_Motor_Temp: 8 MCU
 SG_ MCU_Controller_Temperature : 0|8@1- (1,0) [-128|127] " C"  BMS,VCU,IoT,HMI
 SG_ MCU_Motor_Temperature : 8|8@1+ (1,-50) [-50|205] " C"  BMS,VCU,IoT,HMI

BO_ 2552713280 ID_0x18275040_MCU_Status: 8 MCU
 SG_ MCU_Motor_RPM : 0|16@1+ (1,0) [0|65535] "RPM"  BMS,VCU,IoT
 SG_ MCU_PrechargerStatus : 32|1@1+ (1,0) [0|1] ""  BMS,VCU,IoT,HMI
 SG_ MCU_Ignition_Status : 33|1@1+ (1,0) [0|1] ""  BMS,VCU,IoT,HMI

BO_ 2552692609 ID_0x1826FF81_MCU_VCU_Input: 8 VCU
 SG_ Vehicle_Speed : 48|8@1+ (1,0) [0|255] "km/h"  VCU,IoT,HMI
 SG_ Vehicle_Drive_Modes : 56|3@1+ (1,0) [0|7] ""  VCU,IoT,HMI
 SG_ Vehicle_Brake_Percentage : 40|8@1+ (1,0) [0|100] "%"  VCU,IoT,HMI
 SG_ Vehicle_Throttle_Percntage : 32|8@1+ (1,0) [0|100] "%"  VCU,IoT,HMI

VAL_ 2419654480 Battery_Fault 1 "Err-01" ;
VAL_ 2419654480 Batt_High_Temp 1 "Err-02" ;
VAL_ 2419654480 Battery_High_Temp_Cut_off 1 "Err-03" ;
VAL_ 2419654480 Battery_Low_Temp 1 "Err-04" ;
VAL_ 2419654480 Battery_Low_Temp_Cut_off 1 "Err-05" ;
VAL_ 2419654480 Battery_Over_Voltage_Cut_Off 1 "Err-06" ;
VAL_ 2419654480 Battery_Over_Voltage 1 "Err-07" ;
VAL_ 2419654480 Battery_Low_Voltage 1 "Err-08" ;
VAL_ 2419654480 Battery_Low_Voltage_Cut_Off 1 "Err-09" ;
VAL_ 2419654480 Output_Voltage_Failure 1 "Err-10" ;
VAL_ 2419654480 Battery_Internal_Fault 1 "Err-11" ;
VAL_ 2418544720 Key_On_Indicator 0 "BatteryOff" 1 "BatteryON" ;
VAL_ 2485338192 Battery_Vehicle_Mode 0 "Normal" 1 "Economy" 2 "Limp" 3 "Stop" ;
VAL_ 2553303104 MCU_Controller_Fault 1 "ERR30" ;
VAL_ 2552692609 Vehicle_Drive_Modes 0 "Neutral" 1 "Eco" 2 "Sports" 3 "Reverse" 4 "Economy" 5 "Limp" 6 "Gradient" ;
`;
