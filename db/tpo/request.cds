namespace db.tpo;

using {Country} from '@sap/cds/common';

type BusinessKey : String(10);
type SDate       : DateTime;
type LText       : String(1024);


entity Z_GB_TPO_MAST {

    key Request_UUID            : UUID;
    key Request_Number          : BusinessKey;
        FName                   : String(40);
        LName                   : String(40);
        Title                   : String(30);
        Business_Email          : String(241) @mandatory; //@assert.format : '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$';
        Phone_Number            : String(30)  @mandatory; //@assert.format:'^\+?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$';
        Comapny_Name            : String(80);
        Company_Location        : String(80);
        Parent_Company_Name     : String(80);
        Company_Mailing_Address : String(241);
        Street_Number           : String(60);
        Suffix                  : String(20);
        Street_Name             : String(60);
        Unit_Number             : String(10);
        City                    : String(40);
        Province                : String(15);
        Country                 : Country;
        // Country_Code            : String(3);
        Postal_Code             : String(10);
        website                 : String(250);
        Public_Private          : String(10);
        Tax_Country             : Country;
        TIN                     : String(20);
        Scope_Of_Use            : String(250);
        Submission_Date         : Date;
        On_Boarding_Date        : Date;
        On_Boarding_Status      : String(15);
        Off_Boarding_Date       : Date;
        Application_Status      : String(15);
        Document_Uploaded       : Boolean;
        CreatedAt               : Timestamp;
        CreatedBy               : String(10);
        ModifiedAt              : Timestamp;
        ModifiedBy              : String(10);

};

entity Z_GB_TPO_OTP {
    key OTP_UUID            : UUID;
        Request_Id      : BusinessKey;
        OTP                 : String(8) @assert.format : '^[0-9]{8}$';
        MaxAttempts         : Integer default 3;
        TriedAttempts       : Integer ;
        OTPCreatedDateTime  : DateTime;
        OTPValidityDateTime : DateTime;
        OTPExpired          : Boolean;
        OTPUsed             : Boolean;
        OTPVerifiedDateTime : DateTime;


};


