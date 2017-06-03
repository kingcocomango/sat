import React , {Component, PureComponent} from "react";
import PropTypes from "prop-types";
import "../sass/styles.scss";
import {Card,CardTitle,CardText} from "react-md/lib/Cards";

export default class SharesCard extends PureComponent {
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

	}
	CountShareholders() {
		this.state.inst.NumHolders.call().then((ret)=>this.setState({holdercount:ret.toNumber()}));// set the number of shareholders
	}
	PopulateShareholders() {
		let numholders = this.state.holdercount;
		for (var i = 0; i < numholders; i++) {
			// this.state.inst.ShareHolders(i).then((ret)=>{let newarray = [...this.state.shareholders]; newarray[i]=ret.toNumber(); this.setState({shareholders:newarray});});
			this.state.inst.ShareHolders(i).then((ret)=>{this.setState({shareholders: this.state.shareholders.slice(0, i).concat(ret, this.state.shareholders.slice(i + 1))});});
		}
	}
	PopulateShares() {
		let numholders = this.state.holdercount;
		for (var i = 0; i < numholders; i++) {
			if(this.state.shareholders[i] !== undefined){
				//this.state.inst.Shares(this.state.shareholders[i]).then((ret) => {let newarray = [...this.state.shares]; newarray[i]=ret.toNumber(); this.setState({shares:newarray});});
				this.state.inst.Shares(i).then((ret)=>{this.setState({shares: this.state.shares.slice(0, i).concat(ret, this.state.shares.slice(i + 1))});});
			}
		}
	}
	MyShares() {
		this.state.inst.Shares(this.state.coinbase).then((ret)=>this.setState({myshares:ret.toNumber()}));
	}
	render() {
		this.CountShareholders();
		this.PopulateShares();
		this.PopulateShares();
		this.MyShares();
		return(
			<Card>
				<CardTitle title="Shares" />
				<CardText>
					<p> You currently have {this.state.myshares} </p>
				</CardText>
			</Card>
		);
	}
}

SharesCard.propTypes = {
	coinbase: PropTypes.string.isRequired,
	inst: PropTypes.object.isRequired,
};