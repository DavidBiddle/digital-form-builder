import type { PersistenceService } from "./persistenceService";
import Wreck from "@hapi/wreck";
import config from "../../config";
import { FormConfiguration } from "@xgovformbuilder/model";

export class ApiPersistenceService implements PersistenceService {
  logger: any;

  async uploadConfiguration(id: string, configuration: string) {
    console.log(configuration);
    return Wreck.post(`${config.formsApiUrl}/publish`, {
      payload: JSON.stringify({ id, configuration: JSON.parse(configuration) }),
    });
  }

  async uploadConfigurationForUser(
    id: string,
    configuration: string,
    user: string
  ): Promise<any> {
    return Wreck.post(`${config.formsApiUrl}/publish`, {
      payload: JSON.stringify({ id, configuration: JSON.parse(configuration) }),
      headers: {
        "x-api-key": user,
      },
    });
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, configuration);
  }

  async copyConfigurationForUser(
    configurationId: string,
    newName: string,
    user: string
  ): Promise<any> {
    const configuration = await this.getConfigurationForUser(
      configurationId,
      user
    );
    return this.uploadConfiguration(newName, configuration);
  }

  async getConfiguration(id: string) {
    const { payload } = await Wreck.get(
      `${config.formsApiUrl}/published/${id}`
    );
    var configuration = JSON.parse(payload.toString()).values;
    return JSON.stringify(configuration);
  }

  async getConfigurationForUser(id: string, user: string): Promise<string> {
    const { payload } = await Wreck.get(
      `${config.formsApiUrl}/published/${id}`,
      {
        headers: {
          "x-api-key": user,
        },
      }
    );

    var configuration = JSON.parse(payload.toString()).values;
    return JSON.stringify(configuration);
  }

  async listAllConfigurations() {
    const { payload } = await Wreck.get(`${config.formsApiUrl}/published`);
    return JSON.parse(payload.toString());
  }

  async listAllConfigurationsForUser(
    user: string
  ): Promise<FormConfiguration[]> {
    console.log("Getting forms for: ", user);

    const { payload } = await Wreck.get(`${config.formsApiUrl}/published`, {
      headers: {
        "x-api-key": user,
      },
    });
    return JSON.parse(payload.toString());
  }
}
