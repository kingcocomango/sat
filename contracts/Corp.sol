pragma solidity ^0.4.11;

contract Corp {
    uint public LastDay; // The day the last time the contract was called
	uint[30] public Profits; // A ringbuffer of profits
	uint public TotalShares; // This should hold the total number of shares
	address[] public ShareHolders; // Who has equity
	mapping(address=>uint) Shares; // And how much do they have in shares
	mapping(address=>uint) Dividends; // And in wei
	uint overflow; // Any wei that couldnt be distributed fairly
	
	function Corp(uint InitialShares){
	    TotalShares = InitialShares; // as given
	    ShareHolders.push(msg.sender); // The creator is the first shareholder
	    Shares[msg.sender] = InitialShares; // And he holds all the shares
	}
	
	function CalcDay() constant returns(uint){
	    uint curday = now / 86400;
	    return curday % 30; // that gives us the index into the ringbuffer to use
	}
	
	function ClearDays(uint start, uint end){ // This definitely will break 
	    //if not called for 30 days
        for(uint i=start+1; i%30<=end;i++){
            // we dont clear start but we do clear end
            Profits[i%30]=0; // missed days
        }
	}
	
	function Deposit() payable {
	    // This first part distributes the money
	    uint amountsent = msg.value; // How much was payed
	    uint fraction = amountsent/TotalShares; // The smallest piece this contract doles out
	    overflow += amountsent -(fraction*TotalShares); // Not sure what to do with it
	    // uint amountdist = 0; // How much we've given out
	    uint togive = 0; // Will be used to hold how much to give each holder
	    for(uint i=0;i<ShareHolders.length;i++){
	        togive = Shares[ShareHolders[i]]*fraction;
	        Dividends[ShareHolders[i]] += togive;
	    }
	    
	    // And this one handles tracking the monthly profits
	    uint dayindex = CalcDay();
	    if(LastDay != dayindex){
	        ClearDays(LastDay, dayindex); // Empty profits from missed days & today
	        LastDay = dayindex; // And update the day
	    }
	    Profits[dayindex] += amountsent; // Logging for equity creation
	    
	}
	
	function Withdraw() {
	    uint Payable = Dividends[msg.sender]; // This is their profit
	    Dividends[msg.sender] = 0; // We will send all of it
	    msg.sender.transfer(Payable); // If it throws, all is well. Can't be DAO'd
	}
	
	function Transfer(uint amount, address target) {
	    if(Shares[msg.sender] < amount){
	        throw; // Cant transfer what you dont have
	    }
	    Shares[msg.sender] -= amount; // Take from sender
	    if(Shares[target]==0){ // They weren't a shareholder, so we need to add them
	        // Its possible that they were at some point, and just had 0 shares
	        // This isnt an issue aside from inflating some loops. Since this isnt for production
	        // I'm not going to handle it actively.
	        ShareHolders.push(target); // Added them
	    }
	    Shares[target] += amount; // Give to target
	}
	
}