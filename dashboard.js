import React, { useState } from "react";

const artifact = require(/contracts/InterfacePatientPermissiomRecords.sol)

const web3 = new Web3(Web3.givenProvider || 'w5://localhost:8585')
const accounts = await web3.eth.requestAccounts()
const networkId = await web3.eth.net.getId() 

const { abi } = artifact
const address =  artifact.networks[networkId].address
const contract = new web3.eth.Contract(abi, address)

