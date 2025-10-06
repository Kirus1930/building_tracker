import { mount } from '@vue/test-utils';
import ProjectsList from '@/components/ProjectsList.vue';

describe('ProjectsList.vue', () => {
  // Перед каждым тестом сбрасываем и инициализируем localStorage
  beforeEach(() => {
    localStorage.clear();
    // Заполним localStorage некоторыми проектами для тестов
    const sampleProjects = [
      { id: '1', title: 'Test Project 1', description: 'Desc1', deadline: '2025-12-31', done: false, priority: 'Высокий' },
      { id: '2', title: 'Test Project 2', description: 'Desc2', deadline: '', done: true, priority: 'Низкий' }
    ];
    localStorage.setItem('projects', JSON.stringify(sampleProjects));
  });

  it('Отображает список проектов из localStorage', () => {
    const wrapper = mount(ProjectsList);
    // После монтирования, должен прочитать 2 проекта из localStorage
    expect(wrapper.findAll('tbody tr').length).toBe(2);
    // Проверим, что текст названий присутствует
    expect(wrapper.text()).toContain('Test Project 1');
    expect(wrapper.text()).toContain('Test Project 2');
  });

  it('Удаляет проект при клике на кнопку удаления', async () => {
    // Мокируем window.confirm чтобы всегда возвращал true (подтверждение)
    window.confirm = jest.fn(() => true);
    const wrapper = mount(ProjectsList);
    // Изначально 2 проекта
    expect(wrapper.findAll('tbody tr').length).toBe(2);
    // Найдем первую кнопку удаления и кликнем
    const deleteBtn = wrapper.find('button.delete-btn');
    await deleteBtn.trigger('click');
    // После удаления должен остаться 1 проект в таблице
    expect(wrapper.findAll('tbody tr').length).toBe(1);
    // И localStorage тоже должен обновиться
    const projectsAfter = JSON.parse(localStorage.getItem('projects'));
    expect(projectsAfter.length).toBe(1);
    expect(projectsAfter[0].title).toBe('Test Project 2'); // остался второй проект
  });
});
