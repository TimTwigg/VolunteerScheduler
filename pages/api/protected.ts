import { auth } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await auth(req, res)

    if (session) {
        return res.send({
            content: "You can see this because you signed in."
        })
    }

    res.send({
        content: "Sign in to View"
    })
}