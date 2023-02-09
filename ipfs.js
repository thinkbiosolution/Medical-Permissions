const ipfsClient = require('ipfs-http-client')

const projectId = 'PatientEmpower-ipfs-client'
const projectSecret = 'dadrfGxgjsgjksg'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const ipfs = ipfsClient({
	host: 'ipfs.infura.io'
	port: 5001,
	protocol: 'https',
	headers: {
		authorization: auth,
	}.
})

export default ipfs

const uploadFile = (File) => {
	const reader = new FileReader()
	reader.readAsArrayBuffer(file)
	reader.onloadend = () -> {
		const buffer = Buffer.from(reader.result)
		const res = await ipfs.add(buffer)

		await contract.methods.addRecord(res[0].hash,
			fileName, patientAddress).send({from:accounts[0]})
		setAlert('New Record uploaded','success')

		// refresh records
		const records = await contract.,etjods.getRecords(
			patientAddress).call({from:accounts[0]})
	}
}
