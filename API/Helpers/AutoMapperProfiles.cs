using System;
using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<User, RegisterDto>();
        CreateMap<RegisterDto, User>();
        CreateMap<Stock, StockDto>()
            .ForMember(dest => dest.Prices, opt => opt.MapFrom(src => src.Prices))
            .ForMember(dest => dest.News, opt => opt.MapFrom(src => src.News))
            .ForMember(dest => dest.Dividends, opt => opt.MapFrom(src => src.Dividends));

        CreateMap<StockPrice, StockPriceDto>();
        CreateMap<StockNews, StockNewsDto>();
        CreateMap<StockDividend, StockDividendDto>();
         CreateMap<ForumThread, ForumThreadDto>()
                .ForMember(dest => dest.CreatorUsername, opt => opt.MapFrom(src => src.User.UserName));
                
            CreateMap<ForumMessage, ForumMessageDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.UserName));

            CreateMap<CreateThreadDto, ForumThread>();
            CreateMap<CreateMessageDto, ForumMessage>();
    }
}
