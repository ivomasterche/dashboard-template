import * as yup from "yup";

export const VerificationTokenSchema = yup.object().shape({
  token: yup.string().required(),
});
