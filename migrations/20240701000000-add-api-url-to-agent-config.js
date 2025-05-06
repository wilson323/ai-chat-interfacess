'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 添加api_url字段到agent_config表
    await queryInterface.addColumn('agent_config', 'api_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'https://zktecoaihub.com/api/v1/chat/completions'
    });
  },

  async down (queryInterface, Sequelize) {
    // 回滚操作：删除api_url字段
    await queryInterface.removeColumn('agent_config', 'api_url');
  }
};
