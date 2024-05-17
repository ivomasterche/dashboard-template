import * as yup from "yup";

export const ProfileUpdateSchema = yup.object().shape({
  isOAuthUser: yup.string().required(),
  email: yup
    .string()
    .email()
    .when("isOAuthUser", (isOAuthUser, schema) => {
      if (isOAuthUser[0] === "0") {
        return schema.required("Must enter email address");
      }

      return schema;
    }),
  name: yup.string().required(),
});
