import React , {Component} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router,Route, Switch} from "react-router-dom";
import "../sass/styles.scss";
import {GetCoinbase, CheckGetweb3 } from "./DappUtils.jsx";
import Holder from "./Holder.jsx";

class Web3wrapper extends Component {
	constructor(props){
		super(props);
		this.state = {
			web3:null,
			coinbase:null
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
		}
		caller.setState({web3: web3, coinbase:coinbase});
	}
	render(){
		let web3 = this.state.web3;
		let coinbase = this.state.coinbase;
		let passonlocation = this.props.passon;
		if(!web3 || !coinbase ){
			return (
				<p> No web3 or no account </p>
			);
		} else{
			return (
					<Switch>
						<Route exact path="/" location={passonlocation} render={(rprops) => <Holder {...rprops} web3={web3} coinbase={coinbase}/>}  />

					</Switch>
			);
		}
	}
}

class App extends Component{
	render() {
		return (
			<Route render={
				({location}) => (
					<Web3wrapper passon={location} />
				)
			}
			/>
		);
	}
}

ReactDOM.render(<Router><App /></Router>, document.getElementById("root"));