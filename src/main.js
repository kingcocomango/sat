import React , {Component} from "react";
import ReactDOM from "react-dom";
import "../sass/styles.scss";
import {Card,CardTitle,CardText} from "react-md/lib/Cards";

class App extends Component{
	render() {
		return (<Card className="IntroCard"> <CardTitle title="Stuff" /> <CardText>Placeholder</CardText> </Card>);
	}
}

ReactDOM.render(<App />, document.getElementById("root"));