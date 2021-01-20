const { ExpressReceiver } = require('@slack/bolt');
const { default: axios } = require('axios');
require('dotenv').config();
const { guid } = require('../helpers');

const scopes = ['chat:write', 'chat:write:public', 'commands', 'users:read'];
const AWS_API_URL = process.env.AWS_API_ROOT;

const receiver = new ExpressReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        stateSecret: guid(),
        scopes,
        installationStore: {
            storeInstallation: async (installation) => {
                const installationId = installation.team.id; // Installation ID is the {installation.team.id}
    
                installation.installationId = installationId;
    
                return await axios.post(`${AWS_API_URL}/v1`, installation, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.AWS_API_KEY
                    }
                });
            },
            fetchInstallation: async (InstallQuery) => {
                const token = async (teamId) => {
                    return await axios.get(`${AWS_API_URL}/v1?installationId=${teamId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.AWS_API_KEY
                        }
                    })
                };
    
                const payload = await token(InstallQuery.teamId)
                    .then((response) => {
                        return response.data;
                    }).catch((e) => {
                        throw e;
                    });
    
                return payload;
            },
            storeOrgInstallation: async (installation) => {
                const installationId = installation.enterprise.id; // Installation ID is the {installation.enterprise.id}
    
                installation.installationId = installationId;
    
                return await axios.post(`${AWS_API_URL}/v1`, installation, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.AWS_API_KEY
                    }
                });
            },
            fetchOrgInstallation: async (InstallQuery) => {
                const token = async (enterpriseId) => {
                    return await axios.get(`${AWS_API_URL}/v1?installationId=${enterpriseId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.AWS_API_KEY
                        }
                    })
                };
    
                const payload = await token(InstallQuery.enterpriseId)
                    .then((response) => {
                        return response.data;
                    }).catch((e) => {
                        throw e;
                    });
    
                return payload;
            },
        },
    });

module.exports = receiver;