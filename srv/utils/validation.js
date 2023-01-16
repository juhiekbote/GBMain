const errmsg = require("./res-message.json");
module.exports = {
    validatePhoneNumber: function (phoneNumber) {

        if (phoneNumber) {
            var regex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$/;
            var isPhone = regex.test(phoneNumber)
            return isPhone
        } 
    },

    validateEmailId: function (emailId) {
        if (emailId) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            var isEmail = regex.test(emailId)
            return isEmail
        }
        
    },

    getErrorMessage : function(code)
    {
        return errmsg.Errors[code];
    },

    generateOTP : function() 
    {
        var OTP = Math.round(Math.random() * 100000000).toString();
        if(OTP.length != 8){
            this.generateOTP();
        }
        return OTP;
    }
}