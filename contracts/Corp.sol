pragma solidity ^0.4.11;

contract Corp {
    uint public LastDay; // The day the last time the contract was called
	uint[30] public Profits; // A ringbuffer of profits
	uint public TotalShares; // This should hold the total number of shares
	address[] public ShareHolders; // Who has equity
	mapping(address=>uint) Shares; // And how much do they have in shares
	mapping(address=>uint) Dividends; // And in wei
	mapping(address=>bool) Votes; // Maps shareholders to (Voted && VotedYay)
	uint overflow; // Any wei that couldnt be distributed fairly
	bool voting; // Whether or not there is a vote ongoing
	bool public VotePassed; // Whether or not the Vote passed
	uint voteends; // When the vote can be closed
	uint constant maxduration = 1000; // The maximum number of seconds a vote can last
	uint public DilutionPercentage; // How much to dilute by
	uint public AvailableShares; // How many shares are available to buy
	uint public PricePerShare; // The cost in wei of a single share
	
	function Corp(uint InitialShares){
	    TotalShares = InitialShares; // as given
	    ShareHolders.push(msg.sender); // The creator is the first shareholder
	    Shares[msg.sender] = InitialShares; // And he holds all the shares
	    voting = false; // Start off not voting on anything
	    VotePassed = false; // And nothing passed
	    overflow= 0;
	    // Of course, false/0 is the default value but nobody loves a rug being pulled out
	    // from underneath them.
	}
	
	function FindShareholder(address Holder) returns (uint){
		for(uint i=0;i<ShareHolders.length;i++){
			if(ShareHolders[i]==Holder){
				return i; // Return their position in the array. Unlikely we have more than 2^255 shareholders
			}
		}
		throw; // It doesnt like failing
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
	    if(Shares[msg.sender] < amount || amount==0){
	        throw; // Cant transfer what you dont have, or nothing
	    }
	    Shares[msg.sender] -= amount; // Take from sender
	    if(Shares[target]==0){ // They weren't a shareholder, so we need to add them
	        ShareHolders.push(target); // Added them
	    }
	    if(Shares[msg.sender]==0){
	    	uint position = FindShareholder(msg.sender); // Cant fail because at this point we know they're a shareholder
	    	ShareHolders[position] = ShareHolders[ShareHolders.length-1];// move the ultimate shareholder over this one
	    	ShareHolders.length--; // And drop the duplicate. Now we cant have 0 share shareholders 
	    }
	    Shares[target] += amount; // Give to target
	}
	
	function Vote(bool YayOrNay){
	    if(!voting){
	        throw; // You can only vote when voting is ongoing
	    }
	    Votes[msg.sender] = YayOrNay; // They can change their minds at any time
	    
	}
	
	function OpenVoting(uint duration, uint percentage){
	    if(duration > maxduration || voting || VotePassed){ // mainly so I dont lock myself out
	        throw; // Also so votes cant stack, or interfere with dilution
	    }
	    voteends = now+duration;
	    voting = true; // People can vote
	    VotePassed = false; // The current vote hasnt passed
	    DilutionPercentage = percentage;
	}
	
	function CloseAndCount(){
		if(now < voteends || !voting){
			throw; // Not yet
		}
		uint votesyay; // Votes for yes
		uint votesnay; // Votes for no
	    for(uint i=0;i<ShareHolders.length;i++){
	        if(Votes[ShareHolders[i]]==true){ //shareholder being handled this iteration votes yes
	        	votesyay += Shares[ShareHolders[i]]; // Add that holders shares to the count
	        } else{ // didn't vote, or voted no
	        	votesnay += Shares[ShareHolders[i]]; // Add that holders shares to the count
	        }
	    }
	    if(votesyay > votesnay){ // it passed
			VotePassed = true;
	    } else{
	    	VotePassed = false; // Not actually necessary. Here for clarity
	    }
	    voting = false; // No longer voting
	}

	function Dilute(){
		if(!VotePassed){
			throw; // The vote didnt pass, or didnt happen
		}
		// Get the total profits from the past 30 days
		uint profitsum;
		uint newshares = (TotalShares/100)*DilutionPercentage; // I hope solc respects the brackets
		for(uint i=0; i<30; i++){
			profitsum += Profits[i]; // Just a simple sum of the ringbuffer
		}
		uint totalprice = profitsum*100;
		uint shareprice = totalprice / newshares;

		// Usually the compiler would optimize these things away, but I'm vaguely wary of the optimizer so I do it by hand
		// Later on.
		AvailableShares = newshares;
		PricePerShare = shareprice;
		VotePassed = false; // Voting is over
	}

	function BuyShares(uint amount) payable {
		if(amount > AvailableShares || amount == 0){
			throw; // Cant buy more than what exists, or nothing
		}
		AvailableShares -= amount; // No longer in the pool
		TotalShares += amount; // There are new shares
		if(Shares[msg.sender]!=0){ // They were already a shareholder
			Shares[msg.sender] += amount;
		} else{ // they're new and need to be added
			ShareHolders.push(msg.sender); // They're a shareholder now
			Shares[msg.sender] = amount; // And they have this much
		}
	}
	
}