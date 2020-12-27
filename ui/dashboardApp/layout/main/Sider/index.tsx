import React, { useState, useMemo } from 'react'
import {
  BugOutlined,
  CompassOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { Link } from 'react-router-dom'
import { useEventListener } from '@umijs/hooks'
import { useTranslation } from 'react-i18next'
import { useSpring, animated } from 'react-spring'
import client from '@lib/client'

import Banner from './Banner'
import styles from './index.module.less'
import { useClientRequest } from '@lib/utils/useClientRequest'

function useAppMenuItem(registry, appId, title?: string) {
  const { t } = useTranslation()
  const app = registry.apps[appId]
  if (!app) {
    return null
  }
  return (
    <Menu.Item key={appId}>
      <Link to={app.indexRoute} id={appId}>
        {app.icon ? <app.icon /> : null}
        <span>{title ? title : t(`${appId}.nav_title`, appId)}</span>
      </Link>
    </Menu.Item>
  )
}

function useActiveAppId(registry) {
  const [appId, set] = useState('')
  useEventListener('single-spa:routing-event', () => {
    const activeApp = registry.getActiveApp()
    if (activeApp) {
      set(activeApp.id)
    }
  })
  return appId
}

function Sider({
  registry,
  fullWidth,
  defaultCollapsed,
  collapsed,
  collapsedWidth,
  onToggle,
  animationDelay,
}) {
  const { t } = useTranslation()
  const activeAppId = useActiveAppId(registry)

  const { data: currentLogin } = useClientRequest((reqConfig) =>
    client.getInstance().infoWhoami(reqConfig)
  )
  const { data: info } = useClientRequest((reqConfig) =>
    client.getInstance().infoGet(reqConfig)
  )

  const debugSubMenuItems = [useAppMenuItem(registry, 'instance_profiling')]
  const debugSubMenu = (
    <Menu.SubMenu
      key="debug"
      title={
        <span>
          <BugOutlined />
          <span>{t('nav.sider.debug')}</span>
        </span>
      }
    >
      {debugSubMenuItems}
    </Menu.SubMenu>
  )

  let basicSubMenuItems = [
    useAppMenuItem(registry, 'overview'),
    useAppMenuItem(registry, 'cluster_info'),
  ]
  const experimentalBasicMenuItems = [
    useAppMenuItem(registry, 'metrics'),
    useAppMenuItem(registry, 'alerts'),
  ]
  basicSubMenuItems = [...basicSubMenuItems, ...experimentalBasicMenuItems]
  const basicSubMenu = (
    <Menu.SubMenu
      key="basic"
      title={
        <span>
          <AppstoreOutlined />
          <span>{t('nav.sider.basic')}</span>
        </span>
      }
    >
      {basicSubMenuItems}
    </Menu.SubMenu>
  )

  let manageSubMenuItems = [
    useAppMenuItem(registry, 'query_editor'),
    useAppMenuItem(registry, 'data_manager'),
    useAppMenuItem(registry, 'dbusers_manager'),
    useAppMenuItem(registry, 'configuration'),
  ]
  const manageSubMenu = (
    <Menu.SubMenu
      key="manage"
      title={
        <span>
          <SettingOutlined />
          <span>{t('nav.sider.manage')}</span>
        </span>
      }
    >
      {manageSubMenuItems}
    </Menu.SubMenu>
  )

  let manageItems: any[] = []
  manageItems = [manageSubMenu]

  const diagnoseSubMenuItems = [
    useAppMenuItem(registry, 'keyviz'),
    useAppMenuItem(registry, 'statement'),
    useAppMenuItem(registry, 'slow_query'),
    useAppMenuItem(registry, 'diagnose'),
    useAppMenuItem(registry, 'search_logs'),
  ]
  const diagnoseSubMenu = (
    <Menu.SubMenu
      key="diagnose"
      title={
        <span>
          <CompassOutlined />
          <span>{t('nav.sider.diagnose')}</span>
        </span>
      }
    >
      {diagnoseSubMenuItems}
    </Menu.SubMenu>
  )

  let menuItems = [basicSubMenu, ...manageItems, diagnoseSubMenu, debugSubMenu]

  let displayName = currentLogin?.username ?? '...'
  if (currentLogin?.is_shared) {
    displayName += ' (Shared)'
  }

  const extraMenuItems = [
    useAppMenuItem(registry, 'dashboard_settings'),
    useAppMenuItem(registry, 'user_profile', displayName),
  ]

  const transSider = useSpring({
    width: collapsed ? collapsedWidth : fullWidth,
  })

  const defaultOpenKeys = useMemo(() => {
    if (defaultCollapsed) {
      return []
    } else {
      return ['basic', 'manage', 'diagnose', 'debug']
    }
  }, [defaultCollapsed])

  return (
    <animated.div style={transSider}>
      <Layout.Sider
        className={styles.sider}
        width={fullWidth}
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={fullWidth}
        defaultCollapsed={defaultCollapsed}
        theme="light"
      >
        <Banner
          collapsed={collapsed}
          onToggle={onToggle}
          fullWidth={fullWidth}
          collapsedWidth={collapsedWidth}
        />
        <Menu
          subMenuOpenDelay={animationDelay}
          subMenuCloseDelay={animationDelay}
          mode="inline"
          selectedKeys={[activeAppId]}
          style={{ flexGrow: 1 }}
          defaultOpenKeys={defaultOpenKeys}
        >
          {menuItems}
        </Menu>
        <Menu
          subMenuOpenDelay={animationDelay + 200}
          subMenuCloseDelay={animationDelay + 200}
          mode="inline"
          selectedKeys={[activeAppId]}
        >
          {extraMenuItems}
        </Menu>
      </Layout.Sider>
    </animated.div>
  )
}

export default Sider
