'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加 globalVariables 字段
    await queryInterface.addColumn('agent_config', 'global_variables', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });

    // 添加 welcomeText 字段
    await queryInterface.addColumn('agent_config', 'welcome_text', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });

    // 添加 supportsStream 字段（如果不存在）
    try {
      await queryInterface.addColumn('agent_config', 'supports_stream', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    } catch (error) {
      // 字段可能已存在，忽略错误
      console.log('supports_stream 字段可能已存在，跳过添加');
    }

    // 添加 supportsDetail 字段（如果不存在）
    try {
      await queryInterface.addColumn('agent_config', 'supports_detail', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    } catch (error) {
      // 字段可能已存在，忽略错误
      console.log('supports_detail 字段可能已存在，跳过添加');
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除添加的字段
    await queryInterface.removeColumn('agent_config', 'global_variables');
    await queryInterface.removeColumn('agent_config', 'welcome_text');

    // 注意：不删除 supports_stream 和 supports_detail 字段，
    // 因为它们可能在其他地方被使用
  },
};
