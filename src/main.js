import React , {Component} from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { BrowserRouter as Router,Route, Switch} from "react-router-dom";
import "../sass/styles.scss";
import {GetCoinbase, CheckGetweb3 } from "./DappUtils.jsx";
import Holder from "./Holder.jsx";
import SharesCard from "./SharesCard.jsx";

import NavigationDrawer from "react-md/lib/NavigationDrawers";
import NavLink from "./NavLink.jsx"; // Utility class

import WebFontLoader from "webfontloader";

import TruffleContract from "truffle-contract";
import CorpArtifacts from "./contracts/Corp.json";
var Corp = TruffleContract(CorpArtifacts);


const navItems = [{
	exact: true,
	label: "Home",
	to: "/",
	icon: "home",
}, {
	label: "Deposit",
	to: "/deposit",
	icon: "credit_card",
}, {
	label: "Profits",
	to: "/profit",
	icon: "account_balance_wallet",
}, {
	label: "Shares",
	to: "/shares",
	icon: "dashboard",
}, {
	label: "Invest",
	to: "/invest",
	icon: "euro_symbol",
}
];

class Web3wrapper extends Component {
	constructor(props){
		super(props);
		this.state = {
			web3:null,
			coinbase:null,
			inst:null
		};
	}
	componentWillMount(){
		this.redoEth(this);
	}

	redoEth(caller){
		let web3 = CheckGetweb3();
		let coinbase = GetCoinbase(web3);
		if(!web3||!coinbase){
			setTimeout(function(){caller.redoEth(caller);},100);
			return;
		}
		caller.setState({web3: web3, coinbase:coinbase});
		Corp.setProvider(web3.currentProvider);
		Corp.deployed().then((instance)=>{console.log(instance); caller.setState({inst:instance});});
	}
	render(){
		let web3 = this.state.web3;
		let coinbase = this.state.coinbase;
		let instance = this.state.inst;
		let passonlocation = this.props.passon;
		if(!web3 || !coinbase || !instance){
			return (
				<p> No web3 or no account or loading instance </p>
			);
		} else{
			return (
					<Switch>
						<Route exact path="/" location={passonlocation} 
						render={(rprops) => <Holder {...rprops} web3={web3} coinbase={coinbase} inst={instance}/>} 
						/>
						<Route path="/shares" location={passonlocation} 
						render={(rprops) => <SharesCard {...rprops} web3={web3} coinbase={coinbase} inst={instance}/>} 
						/>

					</Switch>
			);
		}
	}
}

Web3wrapper.propTypes = {
	passon: PropTypes.object
};

class App extends Component{
	render() {
		return (
			<Route 
				render={({ location }) => (
					<NavigationDrawer
						drawerTitle="Nav"
						toolbarTitle="Corp Incorporated"
						navItems={navItems.map(props => <NavLink {...props} key={props.to} />)}
						drawerType={NavigationDrawer.DrawerTypes.TEMPORARY}
					>

						<Web3wrapper passon={location}/>

					</NavigationDrawer>
			)}
			/>
		);
	}
}



WebFontLoader.load({
	google: {
		families: ["Roboto:300,400,500,700", "Material Icons"],
	},
});

ReactDOM.render(<Router><App /></Router>, document.getElementById("root"));