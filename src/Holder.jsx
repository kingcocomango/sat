import React from "react";
import PropTypes from "prop-types";
import {Card,CardTitle,CardText} from "react-md/lib/Cards";

var Holder = (props) => (<Card className="IntroCard"> <CardTitle title="Stuff" /> <CardText>Placeholder. Contract deployed at {props.inst.address} </CardText> </Card>);

Holder.propTypes = {
	inst: PropTypes.object,
};

export default Holder;
