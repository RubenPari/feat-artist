import { NAMESPACE_DNS, v5 } from "@std/uuid";
import SpotifyApiService from "../services/spotifyApiService.ts";
import { FastifyReply, FastifyRequest } from "fastify";

const login = async (_request: FastifyRequest, reply: FastifyReply) => {
    const scopes = Deno.env.get("SCOPES")!;

    const data = new TextEncoder().encode("deno.land");
    const state = await v5.generate(NAMESPACE_DNS, data);

    const authorizeURL = SpotifyApiService.getInstance().client
        .createAuthorizeURL(scopes, state);

    reply.redirect(authorizeURL);
};

const callback = async (request: FastifyRequest, reply: FastifyReply) => {
    const code = (request.query as { code: string }).code;

    if (!code) {
        reply.status(500).send({ error: "No code provided" });
        return;
    }

    try {
        const data = await SpotifyApiService.getInstance().client
            .authorizationCodeGrant(
                code!,
            );

        const { access_token, refresh_token } = data.body;

        SpotifyApiService.getInstance().client.setAccessToken(access_token);
        SpotifyApiService.getInstance().client.setRefreshToken(refresh_token);

        reply.send({ message: "Login successful" });
    } catch (error) {
        console.error(error);

        reply.status(500).send({ error: "Login failed" });
    }
};

const logout = (_request: FastifyRequest, reply: FastifyReply) => {
    SpotifyApiService.getInstance().client.resetAccessToken();
    SpotifyApiService.getInstance().client.resetRefreshToken();

    reply.send({ message: "Logout successful" });
};

export { callback, login, logout };
