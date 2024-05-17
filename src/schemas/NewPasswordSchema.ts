import * as yup from "yup";

export const NewPasswordSchema = yup.object().shape({
  token: yup.string().required(),
  password: yup.string().min(8).required(),
});
