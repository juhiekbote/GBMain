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

    this.before(['UPDATE'], 'Z_GB_TPO_MAST', async (req) => {
        try {
            const tx = cds.tx(req);
            const jsondata = removeEmptyOrNull(req.data);
            const TPO_Request_Number = req.data.Request_Number;

            console.log(jsondata);
            console.log('jsondata -' + JSON.stringify(jsondata));
            var columnsIn = jsondata;

            console.log(columnsIn);

            const existingflag = await tx.run(SELECT.one(Z_GB_TPO_MAST).where({ Request_Number: TPO_Request_Number }).columns('FName'));
            console.log(existingflag);
        }
        catch (error) {
            console.log(error.message);

        }
    });

    const removeEmptyOrNull = (obj) => {

        Object.keys(obj).forEach(k =>

            (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k]) ||

            (!obj[k] && obj[k] !== undefined) && delete obj[k]
        );
        return obj;
    };

    this.on("SendOTPInEmail", async function (req, res) {

        var reqNo = req.data.TPO_Req_No;

        var otp ;
        do{
            otp = validation.generateOTP();
        }while(otp.length != 8) 

        var selectQuery = SELECT.from`Z_GB_TPO_MAST`.columns`Business_Email`.where `Request_Number = ${reqNo}`;
        var result = await cds.run(selectQuery); //result[0].Business_Email

        var query = INSERT.into(Z_GB_TPO_OTP).entries({ OTP: otp, OTP_Request_Id:reqNo })
        var qresult = await cds.run(query);

        const transporter = new SapCfMailer("GMAIL");
        const mail = await transporter.sendMail({
            to: result[0].Business_Email,
            subject: `Enbridge: OTP for login `,
            text: `<h2><strong>Dear User,</strong></h2>
            <h2>Enter the below OTP for your Request Number ${reqNo}</h2>
            <h1><strong>${otp}</strong></h1>
            <h2><strong>Best Regards,</strong></h2>
            <h2><strong>Enbridge Team&nbsp;</strong></h2>`
        });
        return JSON.stringify(mail);
        
    });

    



})