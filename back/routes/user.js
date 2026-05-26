import { Router } from "express"
import { UserController } from "../controllers/user.js"
import { requireAdmin } from "../middleware/user.js"

export const userRouter = Router()

userRouter.post("/login", UserController.login)
userRouter.post("/logout", UserController.logout)
userRouter.post("/register", requireAdmin, UserController.create)
userRouter.get("/getuser", requireAdmin, UserController.getAll)
userRouter.delete("/deleteuser/:id", requireAdmin, UserController.deleteUser)
