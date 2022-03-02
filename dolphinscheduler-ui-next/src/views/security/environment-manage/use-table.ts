/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useAsyncState } from '@vueuse/core'
import { reactive, h, ref } from 'vue'
import { parseISO, format } from 'date-fns'
import { NButton, NPopconfirm, NSpace, NTooltip, NTag } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  queryEnvironmentListPaging,
  deleteEnvironmentByCode
} from '@/service/modules/environment'
import { DeleteOutlined, EditOutlined } from '@vicons/antd'
import type {
  EnvironmentRes,
  EnvironmentItem
} from '@/service/modules/environment/types'

export function useTable() {
  const { t } = useI18n()

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
  }

  const createColumns = (variables: any) => {
    variables.columns = [
      {
        title: '#',
        key: 'index',
        render: (row: any, index: number) => index + 1
      },
      {
        title: t('security.environment.environment_name'),
        key: 'name',
        className: 'environment-name'
      },
      {
        title: t('security.environment.environment_config'),
        key: 'config'
      },
      {
        title: t('security.environment.environment_desc'),
        key: 'description'
      },
      {
        title: t('security.environment.worker_groups'),
        key: 'workerGroups',
        render: (row: EnvironmentItem) =>
          h(NSpace, null, {
            default: () =>
              row.workerGroups.map((item: any) =>
                h(
                  NTag,
                  { type: 'success', size: 'small' },
                  { default: () => item }
                )
              )
          })
      },
      {
        title: t('security.environment.create_time'),
        key: 'createTime'
      },
      {
        title: t('security.environment.update_time'),
        key: 'updateTime'
      },
      {
        title: t('security.environment.operation'),
        key: 'operation',
        render(row: any) {
          return h(NSpace, null, {
            default: () => [
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'info',
                        size: 'small',
                        class: 'edit',
                        onClick: () => {
                          handleEdit(row)
                        }
                      },
                      {
                        icon: () => h(EditOutlined)
                      }
                    ),
                  default: () => t('security.environment.edit')
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    handleDelete(row)
                  }
                },
                {
                  trigger: () =>
                    h(
                      NTooltip,
                      {},
                      {
                        trigger: () =>
                          h(
                            NButton,
                            {
                              circle: true,
                              type: 'error',
                              size: 'small',
                              class: 'delete'
                            },
                            {
                              icon: () => h(DeleteOutlined)
                            }
                          ),
                        default: () => t('security.environment.delete')
                      }
                    ),
                  default: () => t('security.environment.delete_confirm')
                }
              )
            ]
          })
        }
      }
    ]
  }

  const variables = reactive({
    columns: [],
    tableData: [],
    page: ref(1),
    pageSize: ref(10),
    searchVal: ref(null),
    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {}
  })

  const handleDelete = (row: any) => {
    deleteEnvironmentByCode({ environmentCode: row.code }).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        searchVal: variables.searchVal
      })
    })
  }

  const getTableData = (params: any) => {
    const { state } = useAsyncState(
      queryEnvironmentListPaging({ ...params }).then((res: EnvironmentRes) => {
        variables.tableData = res.totalList.map((item, index) => {
          item.createTime = format(
            parseISO(item.createTime),
            'yyyy-MM-dd HH:mm:ss'
          )
          item.updateTime = format(
            parseISO(item.updateTime),
            'yyyy-MM-dd HH:mm:ss'
          )
          return {
            ...item
          }
        }) as any
        variables.totalPage = res.totalPage
      }),
      {}
    )

    return state
  }

  return {
    variables,
    getTableData,
    createColumns
  }
}
