import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourse, createCourse, updateCourse, getCategories } from '../api/courses';
import { extractErrorMessage } from '../api/client';
import { Loading, ErrorState } from '../components/StatusStates';

const emptyModule = () => ({ title: '', description: '' });

export default function CourseFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    modules: [emptyModule()],
  });
  const [status, setStatus] = useState(isEditMode ? 'loading' : 'ready');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories(['Programming', 'Design', 'Marketing', 'Business', 'Other']));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    getCourse(id)
      .then((course) => {
        setForm({
          title: course.title,
          description: course.description,
          price: String(course.price),
          category: course.category,
          modules: course.modules.length ? course.modules : [emptyModule()],
        });
        setStatus('ready');
      })
      .catch((err) => {
        setError(extractErrorMessage(err));
        setStatus('error');
      });
  }, [id, isEditMode]);

  function validate() {
    const errors = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (!form.description.trim()) {
      errors.description = 'Description is required.';
    }
    const priceNum = Number(form.price);
    if (form.price === '' || Number.isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Price must be a non-negative number.';
    }
    if (!form.category) {
      errors.category = 'Please choose a category.';
    }
    form.modules.forEach((mod, idx) => {
      if (!mod.title.trim()) {
        errors[`module-${idx}`] = 'Module title is required.';
      }
    });
    return errors;
  }

  function updateModule(idx, field, value) {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[idx] = { ...modules[idx], [field]: value };
      return { ...prev, modules };
    });
  }

  function addModule() {
    setForm((prev) => ({ ...prev, modules: [...prev.modules, emptyModule()] }));
  }

  function removeModule(idx) {
    setForm((prev) => ({ ...prev, modules: prev.modules.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      modules: form.modules
        .filter((mod) => mod.title.trim())
        .map((mod, idx) => ({ ...mod, order: idx })),
    };

    try {
      if (isEditMode) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }
      navigate('/my-courses');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') return <Loading label="Loading course..." />;
  if (status === 'error') return <ErrorState message={error} />;

  return (
    <div className="page course-form-page">
      <h1>{isEditMode ? 'Edit Course' : 'Create Course'}</h1>
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="course-form">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={5}
        />
        {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}

        <label htmlFor="price">Price (USD)</label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}

        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {fieldErrors.category && <p className="field-error">{fieldErrors.category}</p>}

        <fieldset className="modules-fieldset">
          <legend>Modules</legend>
          {form.modules.map((mod, idx) => (
            <div key={idx} className="module-row">
              <input
                type="text"
                placeholder="Module title"
                value={mod.title}
                onChange={(e) => updateModule(idx, 'title', e.target.value)}
              />
              <input
                type="text"
                placeholder="Module description (optional)"
                value={mod.description}
                onChange={(e) => updateModule(idx, 'description', e.target.value)}
              />
              <button type="button" className="btn btn-link btn-danger" onClick={() => removeModule(idx)}>
                Remove
              </button>
              {fieldErrors[`module-${idx}`] && <p className="field-error">{fieldErrors[`module-${idx}`]}</p>}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addModule}>
            + Add module
          </button>
        </fieldset>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create course'}
        </button>
      </form>
    </div>
  );
}
