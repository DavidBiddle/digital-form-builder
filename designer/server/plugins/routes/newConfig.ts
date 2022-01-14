import config from "../../config";
import newFormJson from "../../../new-form.json";
import { nanoid } from "nanoid";
import { publish } from "../../lib/publish";
import { ServerRoute } from "@hapi/hapi";
import { HapiRequest } from "../../types";

export const registerNewFormWithRunner: ServerRoute = {
  method: "post",
  path: "/api/new",
  options: {
    handler: async (request: HapiRequest, h) => {
      const { persistenceService } = request.services([]);
      const { selected, name } = request.payload;

      if (name && name !== "" && !name.match(/^[a-zA-Z0-9 _-]+$/)) {
        return h
          .response("Form name should not contain special characters")
          .type("application/json")
          .code(400);
      }

      const newName = name === "" ? nanoid(10) : name;

      try {
        if (selected.Key === "New") {
          if (
            config.persistentBackend !== "preview" &&
            config.persistentBackend !== "api"
          ) {
            if (request.state["user"]) {
              await persistenceService.uploadConfigurationForUser(
                `${newName}`,
                JSON.stringify(newFormJson),
                request.state["user"]
              );
            } else {
              await persistenceService.uploadConfiguration(
                `${newName}`,
                JSON.stringify(newFormJson)
              );
            }
          }

          await publish(newName, newFormJson);
        } else {
          let copied;
          if (request.state["user"]) {
            await persistenceService.copyConfigurationForUser(
              `${selected.Key}`,
              newName,
              request.state["user"]
            );
            copied = await persistenceService.getConfigurationForUser(
              newName,
              request.state["user"]
            );
          } else {
            await persistenceService.copyConfiguration(
              `${selected.Key}`,
              newName
            );
            copied = await persistenceService.getConfiguration(newName);
          }
          await publish(newName, copied);
        }
      } catch (e) {
        request.logger.error(e);
      }

      const response = {
        id: `${newName}`,
        previewUrl: config.previewUrl,
      };

      return h.response(response).type("application/json").code(200);
    },
  },
};
