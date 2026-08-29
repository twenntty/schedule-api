const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, "Ім'я обов'язкове для заповнення"] 
    },
    lastName: { 
        type: String, 
        required: [true, "Прізвище обов'язкове для заповнення"] 
    },
    patronymic: { 
        type: String, 
        required: false 
    },
    position: { 
        type: String, 
        required: [true, "Посада обов'язкова для заповнення"] 
    },
    educationalInstitution: {
        type: String,
        required: [true, "Навчальний заклад обов'язковий для заповнення"]
    },
    phoneNumber: {
        type: String,
        required: [true, "Номер телефону обов'язковий"],
        unique: true,
        validate: {
            validator: function(v) {
                return /^\+?[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} не є валідним номером телефону!`
        }
    },
    email: { 
        type: String, 
        required: [true, "Електронна пошта обов'язкова"], 
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} не є валідною електронною поштою!`
        }
    },
    password: { 
        type: String, 
        required: [true, "Пароль обов'язковий"] 
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'institution', 'user'],
            message: 'Неприпустима роль користувача'
        },
        required: [true, "Роль обов'язкова для заповнення"]
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);