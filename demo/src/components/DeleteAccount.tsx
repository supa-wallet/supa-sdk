import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import styled from 'styled-components';
import { useSupa } from '@supanovaapp/sdk';
import {
  useToast,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Text,
  Section,
  Modal,
  Flex,
} from '../ui';
import { usePrivy } from '@privy-io/react-auth';

const DangerZone = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.error || '#ef4444'};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space[4]};
  background: ${({ theme }) => theme.colors.bg.tertiary};
`;

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[3]};
  padding: ${({ theme }) => theme.space[4]};
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space[4]};

  svg {
    flex-shrink: 0;
    color: #ef4444;
    margin-top: 2px;
  }
`;

const WarningText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }
`;

const DeleteButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalWarningBox = styled(WarningBox)`
  margin-bottom: ${({ theme }) => theme.space[5]};
`;

const ModalText = styled(Text)`
  margin-bottom: ${({ theme }) => theme.space[4]};
  line-height: 1.6;
`;

const ModalActions = styled(Flex)`
  margin-top: ${({ theme }) => theme.space[5]};
`;

export function DeleteAccount() {
  const { auth } = useSupa();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Получаем токен авторизации
      const token = await auth.getAccessToken();
      
      if (!token) {
        throw new Error('No access token available');
      }

      // Делаем DELETE запрос к /debug/me
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://stage_api.supa.fyi';
      const response = await fetch(`${baseURL}/debug/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete account: ${response.status}`);
      }

      toast.success('Аккаунт успешно удален');
      
      // Закрываем модалку
      setIsModalOpen(false);
      
      // Делаем logout после небольшой задержки
      setTimeout(() => {
        auth.logout();
      }, 1000);
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error?.message || 'Ошибка при удалении аккаунта');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Trash2 /> Dangerous zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DangerZone>
              <Text $weight={600} style={{ marginBottom: 8 }}>
                Delete account
              </Text>
              <Text $color="secondary" $size="sm" style={{ marginBottom: 16 }}>
                Deleting your account is irreversible. All your data will be lost forever.
              </Text>
              <DeleteButton onClick={handleDeleteClick}>
                Удалить мой аккаунт
              </DeleteButton>
            </DangerZone>
          </CardContent>
        </Card>
      </Section>

      <Modal
        open={isModalOpen}
        onClose={handleCancel}
        title={
          <>
            <AlertTriangle style={{ color: '#ef4444' }} />
            Подтверждение удаления аккаунта
          </>
        }
        footer={
          <ModalActions $gap={3} $justify="flex-end">
            <Button onClick={handleCancel} disabled={isDeleting} $variant="secondary">
              Отмена
            </Button>
            <DeleteButton onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Удаление...' : 'Да, удалить аккаунт'}
            </DeleteButton>
          </ModalActions>
        }
      >
        <ModalWarningBox>
          <AlertTriangle size={20} />
          <WarningText>
            <strong>Внимание!</strong> Это действие нельзя отменить.
          </WarningText>
        </ModalWarningBox>

        <ModalText>
          Вы собираетесь <strong>безвозвратно удалить</strong> свой аккаунт. Это приведет к:
        </ModalText>

        <ul style={{ 
          marginBottom: '1rem', 
          paddingLeft: '1.5rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          <li>Удалению всех ваших данных</li>
          <li>Удалению вашего Canton кошелька</li>
          <li>Потере доступа к вашим балансам</li>
          <li>Невозможности восстановить аккаунт</li>
        </ul>

        <ModalText>
          Вы уверены, что хотите продолжить?
        </ModalText>
      </Modal>
    </>
  );
}
