
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
In the smart contact we first we defined a structure to Record Patient’s permission pertaining to medical data. Each block of Patient Permission is stored as Patient name, Hospital Name, Permission Start and End Date, and Type of Medical Information.:

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
In the smart contact we then add the functionality where a new patient can be added / removed.

```javascript
    function addPatient(address _patient)
        public
        onlyOwner
        patientDoesNotExist(_patient)
        hospitalDoesNotExist(_patient)
        notNull(_patient)
    {
        isPatient[_patient] = true;
        emit PatientAddition(_patient);
    }

    function removePatient(address _patient)
        public
        onlyOwner
        patientExist(_patient)
    {
        isPatient[_patient] = false;
        emit PatientRemoval(_patient);
    }

```

We then add functions to the smart contract that can add and retrieve Patient’s permission block. Only a Patient can add records, but both CRO and Patient can read records.

```javascript
   function addRecord (
        address _patientAddress,
        address _hospital,
        uint256 _permissionDateStart,
        uint256 _permissionDateEnd,
        uint256 _typeOfMedicalData)
        public
        onlyOwner
        patientExist(_patientAddress)
        hospitalExist(_hospital)
    {
        records[recordCount][_patientAddress].providedName = false;
        records[recordCount][_patientAddress].patient = _patientAddress;
        records[recordCount][_patientAddress].hospital = _hospital;
        records[recordCount][_patientAddress].permissionDateStart = _permissionDateStart;
        records[recordCount][_patientAddress].permissionDateEnd = _permissionDateEnd;
        records[recordCount][_patientAddress].typeOfMedicalData = _typeOfMedicalData;

        dateRanges[recordCount].permissionDateStart = _permissionDateStart;
        dateRanges[recordCount].permissionDateEnd = _permissionDateEnd;

        emit PatientRecordAdded(recordCount, _patientAddress);

        recordCount += 1;
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
        springToken.transfer(_patientAddress, tokenRewardAmount);
        emit PatientPaid(_patientAddress);
    }
```

After patients share their name, CROs can access their matching records.

```javascript
 function getRecord(uint _recordID, address _patientAddress)
        public
        recordExists(_recordID, _patientAddress)
        patientProvidedName(_recordID, _patientAddress)
        onlyHospital(_recordID, _patientAddress)
        view
        returns (
            string _name,
            address _hospital,
            uint256 _permissionDateStart,
            uint256 _permissionDateEnd,
            uint256 _typeOfMedicalData
        )
    {
        _name = records[_recordID][_patientAddress].name;
        _hospital = records[_recordID][_patientAddress].hospital;
        _permissionDateStart = records[_recordID][_patientAddress].permissionDateStart;
        _permissionDateEnd = records[_recordID][_patientAddress].permissionDateEnd;
        _typeOfMedicalData = records[_recordID][_patientAddress].typeOfMedicalData;
    }
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


CROs can also see the number of patients currently staying within a given time range. Since records cannot be accessed until a patient provides their name, and dates are associated with ethereum addresses, the time range is essentially private since patients cannot be mapped to their current stay until they provide their name.

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
