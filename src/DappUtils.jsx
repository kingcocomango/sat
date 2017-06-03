import Web3 from "web3";

var persistedweb3 = null; 
function CheckGetweb3() {
	console.log("entered CheckGetweb3");
	if(persistedweb3){ // caching the result for speed and accuracy
		return persistedweb3; 
	}

	// Checking if Web3 has been injected by the browser (Mist/MetaMask)
	if (typeof window.web3 !== "undefined" && typeof Web3 !== "undefined") {
		// Use Mist/MetaMask's provider
		let newweb3 = new Web3(window.web3.currentProvider);
		persistedweb3 = newweb3; // lemme just save this
		return newweb3;
	}

	return null; // if its not injected, return null

}

function GetCoinbase(web3){
	if ((!web3 || (!web3.eth.accounts || (web3.eth.accounts.length == 0)))) {
		return null; // no coinbase, or no web3 passed in
	} else {
		return web3.eth.accounts[0]; // returning the first account
	}
}

export {GetCoinbase, CheckGetweb3};