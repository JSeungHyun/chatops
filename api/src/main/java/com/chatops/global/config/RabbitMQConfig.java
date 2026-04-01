package com.chatops.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String CHAT_EXCHANGE = "chat.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String READ_RECEIPT_QUEUE = "read-receipt.queue";
    public static final String FILE_PROCESS_QUEUE = "file-process.queue";

    @Bean
    public DirectExchange chatExchange() { return new DirectExchange(CHAT_EXCHANGE); }

    @Bean
    public Queue notificationQueue() { return new Queue(NOTIFICATION_QUEUE, true); }

    @Bean
    public Queue readReceiptQueue() { return new Queue(READ_RECEIPT_QUEUE, true); }

    @Bean
    public Queue fileProcessQueue() { return new Queue(FILE_PROCESS_QUEUE, true); }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder.bind(notificationQueue()).to(chatExchange()).with("notification");
    }

    @Bean
    public Binding readReceiptBinding() {
        return BindingBuilder.bind(readReceiptQueue()).to(chatExchange()).with("read-receipt");
    }

    @Bean
    public Binding fileProcessBinding() {
        return BindingBuilder.bind(fileProcessQueue()).to(chatExchange()).with("file-process");
    }

    @Bean
    public MessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
