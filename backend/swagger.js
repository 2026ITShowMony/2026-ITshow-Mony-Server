import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mony Backend API',
            version: '1.0.0',
            description: 'Mony 프로젝트 백엔드 API 문서',
            contact: {
                name: 'Mony Team',
                email: 'team@mony.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development Server'
            }
        ]
    },
    apis: ['./routes/*.js']
};

export const specs = swaggerJsdoc(options);