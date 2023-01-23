
<div>



</div>

A Permission Record System (contract deployer) that keeps records of patient permission using IPFS and allows users to retrieve permission using Smart Contracts on the Ethereum Blockchain. 

Built with [Truffle](http://truffleframework.com/) and [zeppelin-solidity](https://github.com/OpenZeppelin/).


### Clone
Clone repo:
```
git clone git@github.com:ThinkBiosolution/Medical-Permissions.git
```

Create a new ```.env``` file in root directory and add your private key:
```
RINKEBY_PRIVATE_KEY="MyPrivateKeyHere..."
ROPSTEN_PRIVATE_KEY="MyPrivateKeyHere..."
```
If you don't have a private key, you can use one provided by Ganache (for development only!):
```
RINKEBY_PRIVATE_KEY="c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"
```

then:
```
<!-- npm install -->
npm install -g truffle

```
To enter Truffle:
```
truffle develop
```
To compile:
```
truffle(develop)> compile
```
To migrate:
```
truffle(develop)> migrate
```
To test:
```
truffle(develop)> test
```
or
```
npm run test
```

## Scope
A Permission Record System (contract deployer) that keeps records of patient permission using IPFS and allows users to retrieve permission using Smart Contracts on the Ethereum Blockchain. The record system includes permission date and type of medical data where permission is applicable (Such as Rx or Vitals or Disease Codes).
:

```javascript
struct Records {
    bool providedName;
    string name;
    address patient;
    address hospital;
    uint256 permissionDateStart;
    uint256 permissionDateEnd;
    uint256 typeOfMedicalData;
}
```
CRO within the network:

```javascript
mapping (address => bool) public isHospital;
```
Can access these records if and only if a patient provides their name:

```javascript
/// @dev Allows a patient to add their name to the record in the network.
/// @param _recordID ID of the patient specific record.
/// @param _name Name for the patient
function addName(uint256 _recordID, string _name)
    public
    patientExist(msg.sender)
    onlyPatient(_recordID)
    recordExists(_recordID, msg.sender)
    notEmpty(_name)
    patientNotProvidedName(_recordID, msg.sender)
{
    records[_recordID][msg.sender].providedName = true;
    records[_recordID][msg.sender].name = _name;
    address hostpitalInRecord = records[_recordID][msg.sender].hospital;
    mappingByName[hostpitalInRecord][_name] += 1;

    payPatient(msg.sender);

    emit NameAddedToRecords(_recordID, msg.sender);
}

```

As an incentive to share permissions, patients get paid in [tokens](./contracts/SpringToken.sol) when they share their name:
```javascript
/// @dev pays a patient for providing their name.
/// @param _patientAddress to receive tokens.
function payPatient(address _patientAddress)
  private
  notNull(_patientAddress)
{
  patientToken.transfer(_patientAddress, tokenRewardAmount);
  emit PatientPaid(_patientAddress);
}
```

After patients share their name, CROs can access their matching records:
```javascript
function getRecord(uint _recordID, address _patientAddress)
  public
  recordExists(_recordID, _patientAddress)
  patientProvidedName(_recordID, _patientAddress)
  onlyHospital(_recordID, _patientAddress)
  view {...}
```

CROs can also search by patient name to see how many records they currently have:
```javascript
/// @dev Allows a Hospital to view the number of records for a patient.
/// @param _name Name for the patient
function getRecordByName(string _name)
  public
  hospitalExist(msg.sender)
  view
  returns (uint256 numberOfRecords)
  {
    if (mappingByName[msg.sender][_name] != 0) {
      numberOfRecords = mappingByName[msg.sender][_name];
      return numberOfRecords;
    }
    else
      return 0;
  }
```

CROs can also see the number of patients currently staying within a given time range:
```javascript
/// @dev Allows a Hospital to view the number of patients on a given date range.
/// @param from Starting date
/// @param to Ending date
function getCurrentPatients(uint from, uint to)
  public
  hospitalExist(msg.sender)
  view
  returns (uint _numberOfPatients)
{
  uint i;
  _numberOfPatients = 0;
  for(i=0; i<recordCount; i++) {
    if(dateRanges[i].admissionDate >= from && dateRanges[i].dischargeDate <= to)
      _numberOfPatients += 1;
    }
}
```

Since records cannot be accessed until a patient provides their name, and dates are
associated with ethereum addresses, the time range is essentially private since patients
cannot be mapped to their current stay until they provide their name.

The contract can be [destroyed](./contracts/TokenDestructible.sol) and the remaining token balance is returned to the owner of the contract.


## Security Analysis
### Mythril
Security analysis performed using [Mythril](https://github.com/NFhbar/mythril).

Results [here](./security/README_MYTHRIL.md).

### Solidity Coverage
To run [Solidity Coverage reports](https://github.com/sc-forks/solidity-coverage):
```
$ npm run coverage
```
Keep in mind solidity-coverage now expects a globally installed Truffle.


## Lint
To fix warnings:
```
$ npm run fix . --ext .js
```
For solium linter:
```
$ solium -d contracts
```

## License
[MIT](./LICENSE.md)
