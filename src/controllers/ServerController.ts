import pool from "../lib/database/index.js";
import { config } from "../lib/config/index.js";
import { GetServersUseCase } from "../domain/useCase/GetServersUseCase.js";
import { Response } from "express";
import { GetChannelInfoUseCase } from "../domain/useCase/GetChannelInfoUseCase.js";
import { CreateServerUseCase } from "../domain/useCase/CreateServerUseCase.js";
import { GetServerInviteCodeUseCase } from "../domain/useCase/GetServerInviteCodeUseCase.js";
import { ServerService } from "../domain/service/implementation/ServerService.js";
import { VerifyTokenRequest } from "../lib/middleware/auth.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetServerForInviteCodeUseCase } from "../domain/useCase/GetServerForInviteCodeUseCase.js";
import { ServerRole } from "../domain/businessObject/ServerChannel.js";

export class ServerController {
  #serverService = new ServerService();

  constructor() {}

  getServers = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const getServersUseCase = new GetServersUseCase();
      const servers = await getServersUseCase.execute(req.user.id);

      res.status(200).json(servers);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getChannelInfo = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const channelId = req.params.id;
      const getChannelInfoUseCase = new GetChannelInfoUseCase();
      const channelInfo = await getChannelInfoUseCase.execute(channelId);

      return res.status(200).json(channelInfo);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  createServer = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const user = req.user;
      const { serverName } = req.body;
      const serverDisplayPicture = req.file;

      let imagePath = undefined;
      if (serverDisplayPicture) {
        const s3Client = new S3Client({ region: process.env.S3_REGION });
        if (config.isProd) {
          imagePath = `${config.uploadPath}/${user.id}/servers/${serverDisplayPicture.filename}`;
          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: imagePath,
            Body: serverDisplayPicture.buffer,
            ContentType: serverDisplayPicture.mimetype,
          });
          await s3Client.send(command);
        } else {
          imagePath = `${req.protocol}://${req.get("host")}/${
            config.uploadPath
          }/${user.id}/servers/${serverDisplayPicture.filename}`;
        }
      }

      const createServerUseCase = new CreateServerUseCase();
      const responseData = await createServerUseCase.execute({
        userId: user.id,
        serverName,
        displayImagePath: imagePath,
      });

      res.status(201).json(responseData);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  sendChannelMessage = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const {
        channelId,
        author: { userId },
        content,
        timeStamp,
        refMessageId,
      } = req.body;

      await this.#serverService.addChannelMessage(
        userId,
        channelId,
        content,
        timeStamp,
        refMessageId
      );

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  createChannel = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const { name, type, serverId, categoryId } = req.body;

      const channelId = await this.#serverService.createServerChannel(
        serverId,
        name,
        type,
        categoryId
      );

      res.status(200).json({ id: channelId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteChannel = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const channelId = req.params.id;

      await pool.query(`DELETE FROM channels WHERE id = $1`, [channelId]);

      res.status(200).json({ message: "successfully deleted channel" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getServerInviteCode = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const useCase = new GetServerInviteCodeUseCase();
      const serverId = req.params.id;

      const inviteCode = await useCase.execute(serverId);

      res.status(200).json({ inviteCode });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getServerForInviteCode = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const useCase = new GetServerForInviteCodeUseCase();
      const inviteCode = req.params.id;

      const serverPreviewInfo = await useCase.execute(inviteCode);

      res.status(200).json(serverPreviewInfo);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  addServerMember = async (req: VerifyTokenRequest, res: Response) => {
    try {
      const { userId, serverId } = req.body;

      const serverPreviewInfo = await this.#serverService.addServerMemeber(
        serverId,
        userId,
        ServerRole.MEMBER
      );

      res.status(200).json(serverPreviewInfo);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
