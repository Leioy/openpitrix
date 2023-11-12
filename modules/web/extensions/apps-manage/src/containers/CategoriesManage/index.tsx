import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { parse } from 'qs';
import { get } from 'lodash';
import { Banner, LoadingOverlay, notify } from '@kubed/components';

import {
  Icon,
  Image,
  Column,
  CategoryDetail,
  AppDetail,
  useBatchActions,
  DeleteConfirmModal,
} from '@ks-console/shared';
import {
  useCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  useAppModifyCateGoryMutation,
} from '../../stores';
import CategoryList from './CategoryList';
import { TableItemField } from '../StoreManage';
import ManageCategoryModal from './ManageCategoryModal';
import ModifyCategoryModal from './ModifyCategoryModal';
import AppDataTable from '../../components/AppDataTable';

import { Categories, Columns, FirstColumn, Head, SecondColumn } from './styles';

function CategoriesManage(): JSX.Element {
  const {
    data: categories = [],
    isLoading,
    refresh,
  } = useCategoryList({ options: { params: { statistics: true } } });
  const [modalType, setModalType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail>();
  const [currentManageCategory, setCurrentManageCategory] = useState<CategoryDetail | undefined>();
  const columns: Column<AppDetail>[] = [
    {
      title: t('NAME'),
      field: 'metadata.name',
      width: '50%',
      searchable: true,
      render: (name, app) => (
        <TableItemField
          label={app.spec.displayName.zh}
          // TODO 此处跳转地址有问题
          value={<Link to={`/apps-manage/store/${app.metadata.name}`}>{name}</Link>}
          // @ts-ignore TODO
          avatar={<Image iconSize={40} src={app.spec.icon} iconLetter={name} />}
        />
      ),
    },
    {
      title: t('WORKSPACE'),
      field: 'metadata.labels["kubesphere.io/workspace"]',
      canHide: true,
      width: '25%',
      render: (_, app) => {
        return get(app, 'metadata.labels["kubesphere.io/workspace"]', '-')
      },
    },
    {
      title: t('LATEST_VERSION'),
      field: 'metadata.annotations["app.kubesphere.io/latest-app-version"]',
      canHide: true,
      width: '25%',
      render: (_, app) => {
        return get(app, 'metadata.annotations["app.kubesphere.io/latest-app-version"]', '-')
      },
    },
  ];

  const tableRef = useRef();

  const modifyCategoryMutation = useAppModifyCateGoryMutation({
    onSuccess: () => {
      mutateSuccess(t('MODIFY_CATEGORY_SUCCESSFULLY'));
    },
  });

  const handleOpenChangeCategoryModal = () => {
    setModalType('modify');
  };

  const renderBatchActions = useBatchActions({
    authKey: 'apps',
    actions: [
      {
        key: 'adjust',
        text: t('CHANGE_CATEGORY'),
        action: 'delete',
        onClick: handleOpenChangeCategoryModal,
      },
    ],
  });

  const closeModal = () => {
    setModalType('');
    setCurrentManageCategory(undefined);
  };

  const mutateSuccess = (message: string) => {
    notify.success(message);
    closeModal();
    refresh();
  };

  const handleCategoryDelete = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { metadata } = currentManageCategory || {};

    if (!metadata?.name) {
      return;
    }

    await deleteCategory(metadata?.name);
    mutateSuccess(t('DELETED_SUCCESSFULLY'));
  };

  const handleOk = async (
    data: Pick<CategoryDetail, 'metadata' | 'spec'>,
  ): Promise<Promise<void>> => {
    const categoryId = currentManageCategory?.metadata?.name;

    if (!categoryId) {
      await createCategory(data);
    } else {
      await updateCategory(categoryId, data);
    }

    mutateSuccess(t(categoryId ? 'MODIFY_SUCCESSFUL' : 'CREATE_SUCCESSFUL'));
  };

  const handleModifyCategoryOk = async (category: string): Promise<Promise<void>> => {
    const currentTable = tableRef.current as any;
    if (currentTable) {
      const selectedRows = currentTable.getSelectedFlatRows();

      const { workspace, cluster, zone } = parse(window.location.search, {
        ignoreQueryPrefix: true,
      });
      // @ts-ignore TODO
      const baseMutateData = selectedRows?.map(({ metadata }) => {
        return {
          workspace,
          cluster,
          zone,
          app_name: metadata.name,
        };
      });

      try {
        await modifyCategoryMutation.mutateAsync({
          baseMutateData,
          param: { category_id: category },
        } as any);
      } catch (error) {
        console.error('Mutation failed:', error);
      }
    }
  };

  return (
    <>
      <Banner
        className="mb12"
        icon={<Icon name="tag" />}
        title={t('APP_CATEGORY_PL')}
        description={t('APP_CATEGORIES_DESC')}
      />
      <Columns>
        <FirstColumn>
          <LoadingOverlay visible={isLoading} />
          <Categories>
            <Head>
              <label>{t('ALL_CATEGORIES_VALUE', { value: categories?.length })}</label>
              <Icon name="add" size={20} onClick={() => setModalType('manage')} />
            </Head>
            <CategoryList
              categories={categories}
              onSelectCategory={setSelectedCategory}
              onManageCategory={(data, type) => {
                setModalType(type);
                setCurrentManageCategory(data);
              }}
            />
          </Categories>
        </FirstColumn>
        <SecondColumn>
          {selectedCategory?.metadata?.name && (
            <AppDataTable
              tableRef={tableRef}
              // @ts-ignore TODO
              columns={columns}
              batchActions={renderBatchActions()}
              categoryId={selectedCategory.metadata?.name}
            />
          )}
        </SecondColumn>
      </Columns>
      {modalType === 'manage' && (
        <ManageCategoryModal
          visible={true}
          detail={currentManageCategory}
          onCancel={closeModal}
          onOk={handleOk}
          categoryNames={categories.map(({ metadata }) => metadata.name)}
        />
      )}
      {modalType === 'delete' && (
        <DeleteConfirmModal
          visible={true}
          tip={t('DELETE_CATEGORY_DESC', { name: currentManageCategory?.metadata?.name })}
          onOk={handleCategoryDelete}
          onCancel={closeModal}
        />
      )}
      {modalType === 'modify' && selectedCategory?.metadata?.name && (
        <ModifyCategoryModal
          visible={true}
          categoryId={selectedCategory.metadata?.name}
          onCancel={closeModal}
          onOk={handleModifyCategoryOk}
          categories={categories}
        />
      )}
    </>
  );
}

export default CategoriesManage;
