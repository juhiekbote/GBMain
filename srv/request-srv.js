const cds = require('@sap/cds');
const dbClass = require("sap-hdbext-promisfied");
const hdbext = require("@sap/hdbext");
const validation = require('./utils/validation');
const errmsg = require("./utils/res-message.json");
const { Z_GB_TPO_OTP } = cds.entities;
const SapCfMailer = require('sap-cf-mailer').default;


module.exports = cds.service.impl(function () {

    this.before('CREATE', 'Z_GB_TPO_MAST', async (req) => {
        try {

            const db = await cds.connect.to('db')
            let dbConn = new dbClass(await dbClass.createConnection(db.options.credentials))
            const sp = await dbConn.loadProcedurePromisified(hdbext, null, 'GET_TPO_REQ_NO')
            const output = await dbConn.callProcedurePromisified(sp, [])
            console.log(output.results)
            console.log(output.results[0].ID)
            req.data.Request_Number = output.results[0].ID.toString();
            // var query = INSERT.into('db.tpo.Z_TPO_REQ_NO').entries({
            //     "TPO_Req_No": output.results[0].ID.toString()
            // });
            // console.log(query)
            // const result = await cds.run(query);

            //Validating Email ID
            var isEmailIdValid = validation.validateEmailId(req.data.Business_Email)
            if (!isEmailIdValid) {
                var errCode = validation.getErrorMessage("101");
                req.error(errCode.error_code, errCode.msg_text);
            }

            //Validation of Phone Number
            var isPhoneValid = validation.validatePhoneNumber(req.data.Phone_Number)

            if (!isPhoneValid) {
                var errCode = validation.getErrorMessage("100");
                req.error(errCode.error_code, errCode.msg_text);
            }

        }
        catch (error) {
            console.log(error.message);

        }
    });



    this.on("SendOTPInEmail", async function (req, res) {

        var reqNo = req.data.TPO_Req_No;
        var otp, email;
        otp = validation.generateOTP();

        var { Business_Email } = await getMasterData(reqNo)
        var query = INSERT.into`db.tpo.Z_GB_TPO_OTP`.entries({ OTP: otp.toString(), Request_Id: reqNo, OTPCreatedDateTime: new Date().toISOString() })
        var qresult = await cds.run(query);

        const transporter = new SapCfMailer("GMAIL");
        const mail = await transporter.sendMail({
            to: Business_Email,
            subject: `Enbridge Onboarding`,
            html: `<!DOCTYPE html> <html><h2><strong>Dear User,</strong></h2>
            <h2>Enter the below OTP for your Request Number ${reqNo}</h2>
            <h1><strong>${otp}</strong></h1>
            <h2><strong>Best Regards,</strong></h2>
            <h2><strong>Enbridge Team&nbsp;</strong></h2></html>`
        }).then(function (req, res) {

            if (req.accepted.length > 0) {
                return `Success`
            } else {
                return `Error`
            }
        }).catch((err) => {
            return err
        });
        if (mail == 'Success') {
            return { status: "Success", message: "Mail Send Successful" }
        } else {
            req.error("424", "Mail Failed")
        }

    });

    

    async function getMasterData(reqNo) {
        var selectQuery = SELECT.from`db.tpo.Z_GB_TPO_MAST`.where`Request_Number = ${reqNo}`;
        var result = await cds.run(selectQuery); //result[0].Business_Email
        return result[0];
    };

    this.on("verifyOTP", async function (req, res) {
        var reqNo = req.data.TPO_Req_No;
        var otp = req.data.OTP;

        var queryOTP = SELECT.from`db.tpo.Z_GB_TPO_OTP`.where`Request_Id = ${reqNo}` .orderBy `OTPCreatedDateTime desc`;
        var result = await cds.run(queryOTP);
        //check if enetered OTP and Stored OTP are matching or not
        if (otp == result[0].OTP){
            return { status: "Success", message: "OTP Verified" }
        }
        else{
            req.error(404, "OTP Verification Failed");
        }



    });


})