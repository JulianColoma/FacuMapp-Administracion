import { Router } from "express"
import { UserController } from "../controllers/user.js"

export const userRouter = Router()

userRouter.post("/login", UserController.login)
userRouter.post("/logout", UserController.logout)
userRouter.post("/register", UserController.create)
userRouter.get("/getuser", UserController.getAll)