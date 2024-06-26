import { Context, HttpRequest } from "@azure/functions"
import { createConnection } from "../shared/mongo";

export async function diagnosticApi(context: Context, req: HttpRequest): Promise<void> {
    try {
        const database = createConnection();
        const db = await database;

        try {
            const Campuses = db.collection("campus");

            try {
                const conect = await Campuses.findOne({ code: req.headers.campuscode });
                if (conect) {
                    context.res = {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: {
                            message: "Se logro hacer consulta en bd",
                        },
                    };
                } else {
                    context.res = {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: {
                            message: "No encontrado",
                        },
                    };
                }
            } catch (err) {
                context.res = {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: {
                        message: "Error al realizar consulta Error: ", err,
                    },
                };
            }
        } catch (err) {
            context.res = {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    message: "Error al obtener coleccion, Error: ", err,
                },
            };
        }

    } catch (err) {
        context.res = {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                message: "Error al conectar a la bd, Error: ", err,
            },
        };
    }
}