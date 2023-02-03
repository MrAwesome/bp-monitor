# bp-monitor

## Description
A simple script to log blood pressure data to a Google Sheet. Written in TypeScript, using the `google-spreadsheet` library.

## Installation
```
git clone https://github.com/MrAwesome/bp-monitor.git
cd bp-monitor
yarn
yarn run ts-node src/index.ts 120 80 60
#                             ^   ^  ^
#                             |   |  heart_rate
#                             |   diastolic
#                             systolic
```

For an easier time, try adding this alias to your shell config (e.g. `.bashrc` or `.zshrc`):
```
bp() {(
    cd ~/bp-monitor
    ts-node src/index.ts $*
)}
```
