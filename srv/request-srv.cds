using db.tpo as tpo from '../db/tpo/request';

service CatalogService {
    entity Z_GB_TPO_MAST as projection on tpo.Z_GB_TPO_MAST;
    entity Z_GB_TPO_OTP  as projection on tpo.Z_GB_TPO_OTP;
    action SendOTPInEmail(TPO_Req_No: String) returns String;
}
