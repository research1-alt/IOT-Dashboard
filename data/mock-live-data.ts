interface VehicleHeaderStats {
  time: string;
  obdStatus: string;
  odometer: string;
  speed: string;
  ignition: string;
}

interface CanDataItem {
  label: string;
  value: string;
}

export const vehicleHeaderStats: VehicleHeaderStats = {
  time: '15-11-25 16:17:14',
  obdStatus: 'Unplugged',
  odometer: '5,569.68 km',
  speed: '0 km/h',
  ignition: 'On',
};

export const canDataDetails: CanDataItem[] = [
  // Column 1
  { label: 'CAN Timestamp', value: '2025-11-15 16:17:14' },
  { label: 'HV Battery Pack Volt', value: '53.99 V' },
  { label: 'sigMinCellVoltSetPoint', value: '2.799' },
  { label: 'Battery Temperature', value: '35 °C' },
  { label: 'sigTotalBatteryAHCapacity', value: '200' },
  { label: 'sigContRegenCurrentLimit_LSB', value: '42' },
  { label: 'Battery Fault', value: 'No Fault' },
  { label: 'Battery Severe Under Temperature', value: 'No Fault' },
  { label: 'Battery Severe Under Voltage', value: 'No Fault' },
  { label: 'NegativeBusbarHighTemperature', value: '0' },
  { label: 'Less Battery During Drive', value: 'No Fault' },
  { label: 'sigVInenseMalfunction', value: '0' },
  { label: 'sigBatteryChargingCycles', value: '17' },
  
  // Column 2
  { label: 'sigBatteryCurrent', value: '49.7' },
  { label: 'Min Cell Voltage', value: '3.381 Volt' },
  { label: 'sigStateOfCharge', value: '69' },
  { label: 'Key On Indicator', value: 'Off' },
  { label: 'sigBatteryDOD', value: '90' },
  { label: 'Vehicle Mode Request', value: 'Stop' },
  { label: 'Battery Over Temperature', value: 'No Fault' },
  { label: 'Battery Severe Over Voltage', value: 'No Fault' },
  { label: 'OutputVoltageFailure', value: '0' },
  { label: 'PositiveBusbarOverTemperature', value: '0' },
  { label: 'Permanent DockPos Temp', value: 'No Fault' },
  { label: 'sigEVInenseSenceMalfunction', value: '0' },
  { label: 'sigBatteryState', value: '4' },

  // Column 3
  { label: 'Ampere Hour', value: '139.06 Ahr' },
  { label: 'Max Cell Voltage', value: '3.372 Volt' },
  { label: 'sigDistanceToEmpty', value: '20' },
  { label: 'Battery Light', value: 'off' },
  { label: 'sigBatteryCharDisCurrent', value: '0' },
  { label: 'sigContRegenCurrentLimit_MSB', value: '90' },
  { label: 'Battery Severe Over Temperature', value: 'No Fault' },
  { label: 'Battery Over Voltage', value: 'No Fault' },
  { label: 'BatteryInternalFailure', value: '0' },
  { label: 'NegativeBusbarOverTemperature', value: '0' },
  { label: 'Permanent Dock Neg Temp', value: 'No Fault' },
  { label: 'sigBatteryThermalRunawayAlert', value: '0' },

  // Column 4
  { label: 'Kilo Watt Hour', value: '7.5 Kwhr' },
  { label: 'sigMaxCellVoltSetPoint', value: '3.549' },
  { label: 'Time-To-Charge', value: '72 Min' },
  { label: 'Battery swapping successful', value: 'No swapping' },
  { label: 'Drive Current Limit', value: '77 Amp' },
  { label: 'sigContIPCurrentLimit_MSB', value: '65' },
  { label: 'Battery Under Temperature', value: 'No Fault' },
  { label: 'Battery Under Voltage', value: 'No Fault' },
  { label: 'PositiveBusbarHighTemperature', value: '0' },
  { label: 'Less Battery During KeyOn', value: 'No Fault' },
  { label: 'sigTCUCommunicationfailure', value: '1' },
  { label: 'sigBatteryThermalRunaway', value: '0' },
];
