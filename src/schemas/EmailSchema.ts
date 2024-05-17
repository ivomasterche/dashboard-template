import * as yup from "yup";

export const EmailSchema = yup.object().shape({
  email: yup.string().email().required(),
});
