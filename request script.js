var req;

	function makeRequest() {
    	if (window.XMLHttpRequest) {
        	req = new XMLHttpRequest();
    	}
    	else if (window.ActiveXObject) {
		    req = new ActiveXObject("Msxml2.XMLHTTP");
    	}
    	else {
    		// Ajax not supported
			return;
    	}

		req.onreadystatechange = function() {
			var txt = "";
    	    if (this.readyState == 4 && this.status == 200) {
				var response = this.responseText;
				console.log (response);
     			document.getElementById("answer").innerHTML = response;
    		}
		};

	}

	function register() {
		input1 = document.getElementById ("input1").value;
		input2 = document.getElementById ("input2").value;
	  	req.open("GET", "/login?input1=" + input1 + "&input2=" + input2, true);
		req.send();
	}