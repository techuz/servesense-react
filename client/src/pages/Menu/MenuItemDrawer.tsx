import { Drawer } from '@/components/primitives/Drawer';
import { emptyMenuItem, type MenuCategory, type MenuItem } from '@/lib/mock/menu';
import { MenuItemForm } from './MenuItemForm';

interface MenuItemDrawerProps {
  open: boolean;
  item: MenuItem | null;
  categories: MenuCategory[];
  defaultCategoryId: string;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
}

/* Thin wrapper: the Add/Edit drawer reuses the exact same MenuItemForm the
   upload review uses, so the manager sees one consistent form everywhere. */
export const MenuItemDrawer = ({
  open,
  item,
  categories,
  defaultCategoryId,
  onClose,
  onSave,
  onDelete,
}: MenuItemDrawerProps) => {
  const isEdit = !!item;
  const initial = item ?? emptyMenuItem(defaultCategoryId);

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit menu item' : 'Add menu item'} size="lg">
      {open && (
        <MenuItemForm
          key={initial.id}
          item={initial}
          categories={categories}
          submitLabel={isEdit ? 'Save changes' : 'Add item'}
          onSave={(saved) => {
            onSave(saved);
            onClose();
          }}
          onCancel={onClose}
          onDelete={
            isEdit && onDelete
              ? (id) => {
                  onDelete(id);
                  onClose();
                }
              : undefined
          }
        />
      )}
    </Drawer>
  );
};
