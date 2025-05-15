'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('agent_config', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      api_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      app_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      api_url: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'https://zktecoaihub.com/api/v1/chat/completions',
      },
      system_prompt: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      temperature: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.7,
      },
      max_tokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2000,
      },
      multimodal_model: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('agent_config');
  }
}; 