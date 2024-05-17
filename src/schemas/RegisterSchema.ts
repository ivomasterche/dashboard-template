import * as yup from "yup";

export const RegisterSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup
    .string()
    .required()
    .min(8)
    .matches(/[a-z]+/, "Password must contain one lowercase character")
    .matches(/[A-Z]+/, "Password must contain one uppercase character")
    .matches(/[@$!%*#?&]+/, "Password must contain one special character")
    .matches(/\d+/, "Password must contain one number"),
  name: yup.string().required(),
});
