import React , {Component} from "react";
import PropTypes from "prop-types";
import "../sass/styles.scss";
import {Card,CardTitle,CardText} from "react-md/lib/Cards";

export default class SharesCard extends Component {
	constructor(props){
		super(props);
		this.state = {
			coinbase: this.props.coinbase,
			inst: this.props.inst,
			holdercount: 0,
			shareholders: [],
			shares: [],
			myshares: 0
		};
		this.CountShareholders = this.CountShareholders.bind(this);
		this.PopulateShareholders = this.PopulateShareholders.bind(this);
		this.PopulateShares = this.PopulateShares.bind(this);
		this.MyShares = this.MyShares.bind(this);
		this.CountShareholders(this);
		this.PopulateShareholders(this);
		this.PopulateShares(this);
		this.MyShares();

	}
	CountShareholders(caller) {
		this.state.inst.NumHolders.call().then((ret)=>this.setState({holdercount:ret.toNumber()}));// set the number of shareholders
		setTimeout(function(){caller.CountShareholders(caller);},1000);
	}
	PopulateShareholders(caller) {
		let numholders = this.state.holdercount;
		for (var i = 0; i < numholders; i++) {
			((z,caller)=>{

				caller.state.inst.ShareHolders(z).then(
					(ret)=>{let newarray = caller.state.shareholders.slice(); newarray[z]=ret; caller.setState({shareholders:newarray});}
					);
			})(i,caller);
			// this.state.inst.ShareHolders(i).then((ret)=>{this.setState({shareholders: this.state.shareholders.slice(0, i).concat(ret, this.state.shareholders.slice(i + 1))});});
		}
		setTimeout(function(){caller.PopulateShareholders(caller);},1000);
	}
	PopulateShares(caller) {
		let numholders = this.state.holdercount;
		for (var i = 0; i < numholders; i++) {
			if(this.state.shareholders[i] !== undefined){
				((z,caller)=>{

					caller.state.inst.Shares(this.state.shareholders[z]).then(
						(ret)=>{let newarray = caller.state.shares.slice(); newarray[z]=ret.toNumber(); caller.setState({shares:newarray});}
						);
				})(i, caller);
				//this.state.inst.Shares(this.state.shareholders[i]).then((ret) => {let newarray = this.state.shareholders.slice(); newarray[i]=ret.toNumber(); this.setState({shares:newarray});});
				//this.state.inst.Shares(i).then((ret)=>{this.setState({shares: this.state.shares.slice(0, i).concat(ret, this.state.shares.slice(i + 1))});});
			}
		}
		setTimeout(function(){caller.PopulateShares(caller);},1000);
	}
	MyShares() {
		this.state.inst.Shares(this.state.coinbase).then((ret)=>this.setState({myshares:ret.toNumber()}));
	}
	render() {
		
		let sharesarr = [];
		[...Array(this.state.holdercount).keys()].map( (index)=>{
			if(index !== undefined && this.state.shareholders[index] !== undefined){
				sharesarr.push(<p key={index}> And {this.state.shareholders[index]} has {this.state.shares[index]}</p>);
			}
		});
		return(
			<Card>
				<CardTitle title="Shares" />
				<CardText>
					<p> You currently have {this.state.myshares} </p>
					{sharesarr}
				</CardText>
			</Card>
		);
	}
}

SharesCard.propTypes = {
	coinbase: PropTypes.string.isRequired,
	inst: PropTypes.object.isRequired,
};