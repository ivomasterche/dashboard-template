import * as yup from "yup";

export const PasswordChangeSchema = yup.object().shape(
  {
    isOAuthUser: yup.boolean().required(),
    hasPassword: yup.string().required(),
    currentPassword: yup
      .string()
      .when(
        ["isOAuthUser", "hasPassword"],
        ([isOAuthUser, hasPassword], schema) => {
          if (!isOAuthUser || hasPassword === "1")
            return schema.required("Must enter current password");
          return schema;
        }
      ),
    password: yup.string().when("password", {
      is: (password: string) => {
        return password !== "";
      },
      then: (schema) => {
        return schema
          .min(8)
          .matches(/[a-z]+/, "Password must contain one lowercase character")
          .matches(/[A-Z]+/, "Password must contain one uppercase character")
          .matches(/[@$!%*#?&]+/, "Password must contain one special character")
          .matches(/\d+/, "Password must contain one number");
      },
    }),
    confirmPassword: yup
      .string()
      .when("password", {
        is: (password: string) => {
          return password !== "";
        },
        then: (schema) => {
          return schema.required("Must confirm password");
        },
      })
      .test("passwords-match", "Passwords must match", function (value) {
        return this.parent.password === value;
      }),
  },
  [["password", "password"]]
);
